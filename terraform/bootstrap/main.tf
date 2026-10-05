# Bootstrap: cria infraestrutura compartilhada de conta — usada por TODOS os
# outros módulos/ambientes deste projeto: o backend remoto de estado (bucket
# S3 + tabela DynamoDB de lock), o provider OIDC do GitHub Actions, e a role
# de CI somente-leitura usada pelo pipeline de plan/drift detection.
#
# Este é o ÚNICO lugar do repositório que usa estado LOCAL — faz sentido,
# já que é ele quem cria o lugar onde o estado remoto vai morar. Depois de
# aplicado uma vez, raramente precisa ser alterado de novo.
#
# Uso:
#   cd terraform/bootstrap
#   terraform init
#   terraform apply -var="project=sistemanex"

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
      Environment = "shared"
      ManagedBy   = "terraform"
    }
  }
}

variable "project" {
  description = "Nome do projeto, usado para nomear os recursos de bootstrap."
  type        = string
  default     = "sistemanex"
}

variable "region" {
  description = "Região AWS onde o backend de estado vive."
  type        = string
  default     = "us-east-1"
}

variable "github_org" {
  type    = string
  default = "guirrasup"
}

variable "github_repo" {
  type    = string
  default = "sistemanex"
}

variable "monthly_budget_usd" {
  description = "Teto de custo mensal da conta AWS (USD) pra disparar os alertas de orçamento. Default pensado pro cenário de só 'dev' no ar (~$75-80/mês reais, estimado) — reajustar pra ~$400-450 quando 'prod' também subir, e de novo depois do primeiro mês real rodando, com base no custo observado."
  type        = number
  default     = 100
}

variable "budget_alert_emails" {
  description = "Emails que recebem alerta de 80%/100% real e 100% projetado do orçamento mensal."
  type        = list(string)
  default     = ["tecnologia@jrgrupo.com.br"]
}

resource "aws_s3_bucket" "terraform_state" {
  bucket = "${var.project}-terraform-state"

  # Nunca destrua isso sem antes garantir que o estado foi migrado — um
  # "terraform destroy" acidental aqui apagaria o histórico de toda a infra.
  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "terraform_state" {
  bucket                  = aws_s3_bucket.terraform_state.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_dynamodb_table" "terraform_lock" {
  name         = "${var.project}-terraform-lock"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}

# Provider OIDC do GitHub Actions — existe no máximo UM por conta AWS por URL
# de provedor (não por projeto/ambiente). Cada ambiente (dev, prod) tem seu
# próprio módulo "cicd"/role de deploy, mas os dois PRECISAM apontar pro
# MESMO provider aqui — se cada "terraform apply" de ambiente tentasse criar
# o seu, o segundo falharia com "EntityAlreadyExists". Por isso mora no
# bootstrap (account-wide, aplicado uma vez), igual ao bucket/tabela de
# estado acima.
resource "aws_iam_openid_connect_provider" "github" {
  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]

  # A AWS/GitHub documentaram por anos os dois primeiros thumbprints abaixo
  # (cadeia DigiCert) — mas em 2026-10 o GitHub passou a servir
  # token.actions.githubusercontent.com via Let's Encrypt (confirmado via
  # "openssl s_client" direto no endpoint), invalidando os antigos e causando
  # "Not authorized to perform sts:AssumeRoleWithWebIdentity" em produção.
  # Mantidos os dois antigos (não custam nada, até 5 thumbprints são aceitos)
  # e adicionados o intermediário e a raiz atuais da cadeia Let's Encrypt.
  thumbprint_list = [
    "6938fd4d98bab03faadb97b34396831e3780aea1", # antigo (DigiCert) — legado
    "1c58a3a8518e8759bf075b76b750d4f2df264fcd", # antigo (DigiCert) — legado
    "2d74d6dfd96eea55ad7baafa0d3c6552b2dadc37", # intermediário "Let's Encrypt YR2" (atual)
    "ab9d0263244dd0326eb67015705a667e79cfe998", # raiz "ISRG Root YR" (atual)
  ]
}

# Role de CI somente-leitura — usada pelos workflows terraform-ci.yml (plan
# em PR) e terraform-drift.yml (plan agendado). Diferente da role de deploy
# do módulo "cicd" (que é escopada por branch e tem permissão de escrita),
# esta é compartilhada entre TODOS os ambientes/branches/PRs deste repo —
# faz sentido porque ela não escreve nada: "ReadOnlyAccess" é a policy
# gerenciada da AWS e, por desenho da própria AWS, exclui ações que
# retornam segredo em texto puro (secretsmanager:GetSecretValue,
# ssm:GetParameter com decryption, kms:Decrypt) — então mesmo um PR de fora
# rodando "terraform plan" não consegue ler o VALOR de nenhum segredo.
data "aws_iam_policy_document" "ci_plan_assume" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    # Libera tanto PRs (sub = "repo:ORG/REPO:pull_request") quanto push em
    # qualquer branch (sub = "repo:ORG/REPO:ref:refs/heads/*", usado pelo
    # job agendado de drift detection) — sempre deste repo específico.
    # StringLike (não StringEquals) porque o segundo padrão usa wildcard.
    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values = [
        "repo:${var.github_org}/${var.github_repo}:pull_request",
        "repo:${var.github_org}/${var.github_repo}:ref:refs/heads/*",
      ]
    }
  }
}

resource "aws_iam_role" "ci_plan" {
  name                 = "${var.project}-ci-plan"
  assume_role_policy   = data.aws_iam_policy_document.ci_plan_assume.json
  max_session_duration = 3600
}

resource "aws_iam_role_policy_attachment" "ci_plan_readonly" {
  role       = aws_iam_role.ci_plan.name
  policy_arn = "arn:aws:iam::aws:policy/ReadOnlyAccess"
}

# AWS Budgets — alerta de custo mensal. Importante: isto é um orçamento de
# CONTA inteira, não filtrado por tag Project/Environment (o AWS Budgets até
# suporta filtro por tag, mas só funciona depois que a tag em questão foi
# ativada manualmente em "Billing > Cost allocation tags", ação de console
# fora do Terraform, e não é retroativo). Mora aqui no bootstrap — não em
# "dev" ou "prod" — justamente pra existir independente de qual ambiente
# está de fato aplicado no momento (ex: só "dev" no ar ainda).
resource "aws_budgets_budget" "monthly_cost" {
  name         = "${var.project}-monthly-cost"
  budget_type  = "COST"
  limit_amount = tostring(var.monthly_budget_usd)
  limit_unit   = "USD"
  time_unit    = "MONTHLY"

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = var.budget_alert_emails
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 100
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = var.budget_alert_emails
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 100
    threshold_type             = "PERCENTAGE"
    notification_type          = "FORECASTED"
    subscriber_email_addresses = var.budget_alert_emails
  }
}

output "state_bucket" {
  value = aws_s3_bucket.terraform_state.bucket
}

output "lock_table" {
  value = aws_dynamodb_table.terraform_lock.name
}

output "github_oidc_provider_arn" {
  description = "Cole isto (ou deixe os ambientes derivarem via data.aws_caller_identity, já feito em dev/prod) como 'existing_oidc_provider_arn' no módulo 'cicd' de QUALQUER ambiente — nunca deixe mais de um ambiente com create_oidc_provider=true."
  value       = aws_iam_openid_connect_provider.github.arn
}

output "ci_plan_role_arn" {
  description = "Cole em TF_PLAN_ROLE_ARN nas variáveis do repositório no GitHub (Settings → Secrets and variables → Actions → Variables) — é compartilhada entre dev/prod/PRs, não por-environment como o deploy_role_arn do módulo cicd."
  value       = aws_iam_role.ci_plan.arn
}
