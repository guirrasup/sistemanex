terraform {
  required_version = ">= 1.6"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
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

# CloudFront/ACM exigem us-east-1 independente da região do resto —
# provider adicional só pro módulo "edge".
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
  environment = "dev"
}

# O provider OIDC do GitHub Actions é criado uma única vez no bootstrap
# (account-wide) — deriva o ARN pela conta atual em vez de criar de novo
# aqui, pra não colidir com o mesmo recurso que o ambiente "prod" também
# referencia.
data "aws_caller_identity" "current" {}

module "networking" {
  source = "../../modules/networking"

  project            = var.project
  environment        = local.environment
  single_nat_gateway = true # dev: economia > disponibilidade
}

module "database" {
  source = "../../modules/database"

  project            = var.project
  environment        = local.environment
  vpc_id             = module.networking.vpc_id
  private_subnet_ids = module.networking.private_subnet_ids
  # t4g.micro (Graviton) sem capacidade disponível nesta conta/região no
  # momento do apply (InsufficientDBInstanceCapacity) — t3.micro (x86) usa
  # um pool de capacidade diferente e também é elegível ao RDS Free Tier.
  instance_class      = "db.t3.micro"
  multi_az            = false
  deletion_protection = false

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

module "compute" {
  source = "../../modules/compute"

  project            = var.project
  environment        = local.environment
  vpc_id             = module.networking.vpc_id
  public_subnet_ids  = module.networking.public_subnet_ids
  private_subnet_ids = module.networking.private_subnet_ids
  desired_count      = 1
  image_tag          = var.image_tag

  database_url_secret_arn        = module.database.database_url_secret_arn
  jwt_secret_arn                 = module.secrets.jwt_secret_arn
  certificado_encryption_key_arn = module.secrets.certificado_encryption_key_arn
  conectagov_secret_arns         = module.secrets.conectagov_secret_arns
  ssm_parameters                 = module.secrets.ssm_parameters
  rds_security_group_id          = module.database.security_group_id
}

module "cicd" {
  source = "../../modules/cicd"

  project            = var.project
  environment        = local.environment
  github_environment = "dev"

  # Provider OIDC já existe (criado uma vez no bootstrap) — nunca deixar mais
  # de um ambiente com create_oidc_provider=true (ver comentário lá).
  create_oidc_provider       = false
  existing_oidc_provider_arn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:oidc-provider/token.actions.githubusercontent.com"

  ecr_repository_arn          = module.compute.ecr_repository_arn
  ecs_cluster_arn             = module.compute.ecs_cluster_arn
  ecs_service_arn             = module.compute.ecs_service_arn
  ecs_task_execution_role_arn = module.compute.ecs_task_execution_role_arn
  ecs_task_role_arn           = module.compute.ecs_task_role_arn
  frontend_bucket_arn         = module.edge.frontend_bucket_arn
  # coalesce (não try!) — o output é null (não um erro) antes da 1ª fase do
  # ACM/CloudFront existir, e try() não substitui valores null, só erros.
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
}
