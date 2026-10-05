variable "project" { type = string }
variable "environment" { type = string }
variable "rds_instance_arn" {
  description = "ARN da instância RDS a proteger (output 'arn' do módulo 'database')."
  type        = string
}
variable "retention_days" {
  description = "Quantos dias o AWS Backup guarda cada snapshot. 35 dias cobre recuperação operacional (erro humano, corrupção) — a retenção fiscal de ~5 anos dos documentos NF-e/CT-e em si é uma obrigação sobre o CONTEÚDO (já durável no Postgres/XMLs), não sobre este backup de infraestrutura; não inflar este valor pra tentar resolver isso."
  type        = number
  default     = 35
}
