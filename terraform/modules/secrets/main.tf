# Segredos de aplicação que não pertencem a nenhum outro recurso específico
# (a DATABASE_URL fica no módulo "database", junto da própria instância RDS).
#
# JWT_SECRET e CERTIFICADO_ENCRYPTION_KEY são gerados aqui (criptografia
# forte, nunca reaproveitar entre ambientes — dev e prod sempre têm valores
# diferentes porque cada "environment" roda este módulo uma vez).

terraform {
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

locals {
  name = "${var.project}-${var.environment}"
}

resource "random_id" "jwt_secret" {
  byte_length = 32
}

resource "random_id" "certificado_encryption_key" {
  byte_length = 32
}

resource "aws_secretsmanager_secret" "jwt_secret" {
  name = "${local.name}/JWT_SECRET"
}

resource "aws_secretsmanager_secret_version" "jwt_secret" {
  secret_id     = aws_secretsmanager_secret.jwt_secret.id
  secret_string = random_id.jwt_secret.hex
}

resource "aws_secretsmanager_secret" "certificado_encryption_key" {
  name = "${local.name}/CERTIFICADO_ENCRYPTION_KEY"
}

resource "aws_secretsmanager_secret_version" "certificado_encryption_key" {
  secret_id     = aws_secretsmanager_secret.certificado_encryption_key.id
  secret_string = random_id.certificado_encryption_key.hex
}

# ConectaGov: valores vindos de fora (ver variables.tf). Só cria o segredo
# se o valor foi de fato fornecido, pra não sobrescrever com string vazia
# num primeiro apply antes de ter as credenciais reais em mãos.
resource "aws_secretsmanager_secret" "conectagov_client_id" {
  count = var.conectagov_client_id != "" ? 1 : 0
  name  = "${local.name}/CONECTAGOV_CLIENT_ID"
}

resource "aws_secretsmanager_secret_version" "conectagov_client_id" {
  count         = var.conectagov_client_id != "" ? 1 : 0
  secret_id     = aws_secretsmanager_secret.conectagov_client_id[0].id
  secret_string = var.conectagov_client_id
}

resource "aws_secretsmanager_secret" "conectagov_client_secret" {
  count = var.conectagov_client_secret != "" ? 1 : 0
  name  = "${local.name}/CONECTAGOV_CLIENT_SECRET"
}

resource "aws_secretsmanager_secret_version" "conectagov_client_secret" {
  count         = var.conectagov_client_secret != "" ? 1 : 0
  secret_id     = aws_secretsmanager_secret.conectagov_client_secret[0].id
  secret_string = var.conectagov_client_secret
}

resource "aws_secretsmanager_secret" "conectagov_cpf_usuario" {
  count = var.conectagov_cpf_usuario != "" ? 1 : 0
  name  = "${local.name}/CONECTAGOV_CPF_USUARIO"
}

resource "aws_secretsmanager_secret_version" "conectagov_cpf_usuario" {
  count         = var.conectagov_cpf_usuario != "" ? 1 : 0
  secret_id     = aws_secretsmanager_secret.conectagov_cpf_usuario[0].id
  secret_string = var.conectagov_cpf_usuario
}

resource "aws_secretsmanager_secret" "conectagov_private_key" {
  count = var.conectagov_private_key != "" ? 1 : 0
  name  = "${local.name}/CONECTAGOV_PRIVATE_KEY"
}

resource "aws_secretsmanager_secret_version" "conectagov_private_key" {
  count         = var.conectagov_private_key != "" ? 1 : 0
  secret_id     = aws_secretsmanager_secret.conectagov_private_key[0].id
  secret_string = var.conectagov_private_key
}

# Configuração NÃO sensível: Parameter Store (grátis no tier Standard).
resource "aws_ssm_parameter" "port" {
  name  = "/${local.name}/PORT"
  type  = "String"
  value = "3333"
}

resource "aws_ssm_parameter" "frontend_url" {
  name  = "/${local.name}/FRONTEND_URL"
  type  = "String"
  value = var.frontend_url
}

resource "aws_ssm_parameter" "seed_ambiente" {
  name  = "/${local.name}/SEED_AMBIENTE"
  type  = "String"
  value = var.seed_ambiente
}
