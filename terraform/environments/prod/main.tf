terraform {
  required_version = ">= 1.6"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

provider "aws" {
  region = var.region

  default_tags {
    tags = {
      Project     = var.project
      Environment = local.environment
      ManagedBy   = "terraform"
    }
  }
}

# CloudFront/ACM e o WAFv2 (scope=CLOUDFRONT) exigem us-east-1 independente
# da região do resto — provider adicional pros módulos "edge" e "waf".
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project     = var.project
      Environment = local.environment
      ManagedBy   = "terraform"
    }
  }
}

locals {
  environment = "prod"
}

# O provider OIDC do GitHub Actions é criado uma única vez no bootstrap
# (account-wide) — deriva o ARN pela conta atual em vez de criar de novo
# aqui, pra não colidir com o mesmo recurso que o ambiente "dev" também
# referencia.
data "aws_caller_identity" "current" {}

module "networking" {
  source = "../../modules/networking"

  project            = var.project
  environment        = local.environment
  single_nat_gateway = false # prod: 1 NAT Gateway por AZ — evita que a queda de uma AZ tire a saída de internet das outras
  flow_logs_enabled  = true
}

module "database" {
  source = "../../modules/database"

  project             = var.project
  environment         = local.environment
  vpc_id              = module.networking.vpc_id
  private_subnet_ids  = module.networking.private_subnet_ids
  instance_class      = "db.t4g.medium"
  multi_az            = true
  deletion_protection = true

  backup_retention_days = 14
  allocated_storage     = 50
  max_allocated_storage = 500

  # Preenchido depois que o módulo "compute" existir (dependência circular
  # resolvida via security_group_rule no próprio módulo compute, não aqui).
  allowed_security_group_ids = []
}

module "secrets" {
  source = "../../modules/secrets"

  project      = var.project
  environment  = local.environment
  frontend_url = "https://${var.domain_name}"

  conectagov_client_id     = var.conectagov_client_id
  conectagov_client_secret = var.conectagov_client_secret
  conectagov_cpf_usuario   = var.conectagov_cpf_usuario
  conectagov_private_key   = var.conectagov_private_key
}

# Secret do header de verificação de origem CloudFront -> ALB (ver módulos
# "compute" e "edge"). Mesmo padrão do módulo "database" pra gerar segredo
# (random_password + registro no Secrets Manager): nenhum processo em
# runtime lê de volta do Secrets Manager — os dois consumidores (listener
# rule do ALB e origin do CloudFront) recebem o valor direto via variável do
# Terraform; o Secrets Manager aqui é só auditoria/rotação.
resource "random_password" "origin_verify" {
  length  = 32
  special = false
}

resource "aws_secretsmanager_secret" "origin_verify" {
  name = "${var.project}-${local.environment}/ORIGIN_VERIFY_SECRET"
}

resource "aws_secretsmanager_secret_version" "origin_verify" {
  secret_id     = aws_secretsmanager_secret.origin_verify.id
  secret_string = random_password.origin_verify.result
}

module "compute" {
  source = "../../modules/compute"

  project            = var.project
  environment        = local.environment
  vpc_id             = module.networking.vpc_id
  public_subnet_ids  = module.networking.public_subnet_ids
  private_subnet_ids = module.networking.private_subnet_ids
  desired_count      = 2
  task_cpu           = "512"
  task_memory        = "1024"
  image_tag          = var.image_tag

  database_url_secret_arn        = module.database.database_url_secret_arn
  jwt_secret_arn                 = module.secrets.jwt_secret_arn
  certificado_encryption_key_arn = module.secrets.certificado_encryption_key_arn
  conectagov_secret_arns         = module.secrets.conectagov_secret_arns
  ssm_parameters                 = module.secrets.ssm_parameters
  rds_security_group_id          = module.database.security_group_id

  # Escala 2-6 tasks por CPU (65%) e por request count por target — ver
  # defaults do módulo. ALB continua sem ACM próprio (CloudFront termina o
  # TLS); o hardening de origem abaixo é o que impede bypass do WAF.
  autoscaling_enabled        = true
  origin_verify_enabled      = true
  origin_verify_secret_value = random_password.origin_verify.result
  access_logs_enabled        = true
}

module "waf" {
  source = "../../modules/waf"
  providers = {
    aws.us_east_1 = aws.us_east_1
  }

  project     = var.project
  environment = local.environment
}

module "cicd" {
  source = "../../modules/cicd"

  project       = var.project
  environment   = local.environment
  github_branch = "main" # só workflows rodando em main podem assumir a role de prod

  # Provider OIDC já existe (criado uma vez no bootstrap) — nunca deixar mais
  # de um ambiente com create_oidc_provider=true (ver comentário lá; "dev"
  # já segue a mesma regra).
  create_oidc_provider       = false
  existing_oidc_provider_arn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:oidc-provider/token.actions.githubusercontent.com"

  ecr_repository_arn          = module.compute.ecr_repository_arn
  ecs_cluster_arn             = module.compute.ecs_cluster_arn
  ecs_service_arn             = module.compute.ecs_service_arn
  ecs_task_execution_role_arn = module.compute.ecs_task_execution_role_arn
  ecs_task_role_arn           = module.compute.ecs_task_role_arn
  frontend_bucket_arn         = module.edge.frontend_bucket_arn
  # coalesce (não try!) — o output é null (não um erro) antes da 2ª fase do
  # ACM/CloudFront existir (wait_for_validation=true), e try() não substitui
  # valores null, só erros. Reaplique depois que
  # module.edge.cloudfront_distribution_arn deixar de ser nulo pra fechar o
  # escopo certinho.
  cloudfront_distribution_arn = coalesce(module.edge.cloudfront_distribution_arn, "arn:aws:cloudfront::*:distribution/*")
}

module "edge" {
  source = "../../modules/edge"
  providers = {
    aws.us_east_1 = aws.us_east_1
  }

  project             = var.project
  environment         = local.environment
  domain_name         = var.domain_name
  alb_dns_name        = module.compute.alb_dns_name
  wait_for_validation = var.wait_for_validation
  web_acl_arn         = module.waf.web_acl_arn

  origin_verify_enabled      = true
  origin_verify_secret_value = random_password.origin_verify.result
  access_logs_enabled        = true
}

module "backup" {
  source = "../../modules/backup"

  project          = var.project
  environment      = local.environment
  rds_instance_arn = module.database.arn
}

module "observability" {
  source = "../../modules/observability"

  project     = var.project
  environment = local.environment
  alert_email = var.alert_email

  ecs_cluster_name       = module.compute.ecs_cluster_name
  ecs_service_name       = module.compute.ecs_service_name
  alb_arn_suffix         = module.compute.alb_arn_suffix
  db_instance_identifier = module.database.db_instance_identifier
}

# AWS Budgets morava aqui antes — movido pra terraform/bootstrap/main.tf
# porque é um orçamento de CONTA inteira (não filtrado por ambiente), e por
# isso precisa existir independente de "prod" estar aplicado ou não (ex:
# enquanto só "dev" está no ar). Ver bootstrap pra detalhes.
