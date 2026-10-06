variable "project" {
  type = string
}

variable "environment" {
  type = string
}

variable "github_org" {
  type    = string
  default = "guirrasup"
}

variable "github_repo" {
  type    = string
  default = "sistemanex"
}

variable "github_environment" {
  description = "Nome do GitHub Environment (dev, prod) que tem permissão de assumir esta role. Escopo estreito de propósito: a role de dev NUNCA deve conseguir tocar em prod. IMPORTANTE: quando o job do workflow declara 'environment:', o claim 'sub' do token OIDC do GitHub usa o formato 'repo:ORG@id/REPO@id:environment:NOME' em vez do formato baseado em branch ('repo:ORG/REPO:ref:refs/heads/BRANCH') — confirmado empiricamente decodificando o JWT real, não documentado com clareza em lugar nenhum."
  type        = string
}

variable "ecr_repository_arn" {
  type = string
}

variable "ecs_cluster_arn" {
  type = string
}

variable "ecs_service_arn" {
  type = string
}

variable "ecs_task_execution_role_arn" {
  type = string
}

variable "ecs_task_role_arn" {
  type = string
}

# Já existe UM provider OIDC por conta AWS (não por projeto) — se outro
# módulo/projeto desta mesma conta já criou, reaproveite o ARN em vez de
# tentar criar de novo (o create é condicional via "create_oidc_provider").
variable "create_oidc_provider" {
  type    = bool
  default = true
}

variable "existing_oidc_provider_arn" {
  type    = string
  default = ""
}

variable "frontend_bucket_arn" {
  description = "ARN do bucket S3 do frontend (output 'frontend_bucket_arn' do módulo 'edge') — pro deploy role poder fazer 's3 sync'."
  type        = string
}
variable "cloudfront_distribution_arn" {
  description = "ARN da distribution CloudFront (output 'cloudfront_distribution_arn' do módulo 'edge') — pro deploy role poder invalidar cache."
  type        = string
}
