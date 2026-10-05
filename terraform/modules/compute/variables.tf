variable "project" {
  type = string
}

variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "public_subnet_ids" {
  type = list(string)
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "container_port" {
  type    = number
  default = 3333
}

variable "task_cpu" {
  description = "256 = 0.25 vCPU. Suficiente pro tráfego B2B modesto deste sistema; subir se o profiling pedir."
  type        = string
  default     = "256"
}

variable "task_memory" {
  type    = string
  default = "512"
}

variable "desired_count" {
  description = "Quantas tasks rodando em paralelo — 1 em dev, pelo menos 2 em prod (pra sobreviver a um deploy/falha de task sem downtime)."
  type        = number
  default     = 1
}

variable "image_tag" {
  description = "Tag da imagem no ECR a rodar. O pipeline de CI/CD atualiza isso a cada deploy (ou usa 'latest' + force-new-deployment)."
  type        = string
  default     = "latest"
}

# ARNs dos segredos/parâmetros que o container precisa receber como env vars
# no boot — vêm dos módulos "database" e "secrets".
variable "database_url_secret_arn" {
  type = string
}

variable "jwt_secret_arn" {
  type = string
}

variable "certificado_encryption_key_arn" {
  type = string
}

variable "conectagov_secret_arns" {
  type    = map(string)
  default = {}
}

variable "ssm_parameters" {
  description = "Mapa NOME_DA_ENV_VAR => ARN dos parâmetros não-sensíveis (PORT, FRONTEND_URL, SEED_AMBIENTE) vindos do módulo secrets."
  type        = map(string)
  default     = {}
}

variable "rds_security_group_id" {
  description = "Security group do RDS — recebe a regra de ingress liberando as tasks do ECS."
  type        = string
}

variable "acm_certificate_arn" {
  description = "Se fornecido, o ALB ganha um listener HTTPS (443) além do HTTP. Deixe vazio até o módulo edge/ACM existir."
  type        = string
  default     = ""
}

# ---------------------------------------------------------------------------
# ECS autoscaling
# ---------------------------------------------------------------------------

variable "autoscaling_enabled" {
  description = "Liga o Application Auto Scaling do ECS service. Desligado por padrão (dev usa desired_count fixo)."
  type        = bool
  default     = false
}

variable "autoscaling_min_capacity" {
  type    = number
  default = 2
}

variable "autoscaling_max_capacity" {
  type    = number
  default = 6
}

variable "autoscaling_cpu_target_value" {
  description = "% de CPU média alvo pro target tracking."
  type        = number
  default     = 65
}

variable "autoscaling_request_count_target" {
  description = "Requests por minuto por task alvo pro target tracking (ALBRequestCountPerTarget)."
  type        = number
  default     = 1000
}

variable "autoscaling_scale_out_cooldown" {
  type    = number
  default = 60
}

variable "autoscaling_scale_in_cooldown" {
  type    = number
  default = 300
}

# ---------------------------------------------------------------------------
# ALB origin-verification hardening
# ---------------------------------------------------------------------------

variable "origin_verify_enabled" {
  description = "Liga o hardening (403 fixo pra quem não manda o header secreto). Separado de origin_verify_secret_value de propósito: o valor do secret normalmente vem de um random_password ainda não aplicado (unknown no plan), e count/for_each não podem depender de um valor unknown — esta flag é um bool literal, sempre conhecido no plan."
  type        = bool
  default     = false
}

variable "origin_verify_header_name" {
  description = "Nome do header secreto que o CloudFront manda pro ALB pra provar que a request passou pela CDN/WAF (não veio direto)."
  type        = string
  default     = "X-Origin-Verify"
}

variable "origin_verify_secret_value" {
  description = "Valor secreto do header de verificação — só é exigido quando origin_verify_enabled=true."
  type        = string
  sensitive   = true
  default     = ""
}

# ---------------------------------------------------------------------------
# ALB access logs
# ---------------------------------------------------------------------------

variable "access_logs_enabled" {
  description = "Liga access logs do ALB pra um bucket S3 dedicado — desligado por padrão (dev); ligar em prod pra auditoria."
  type        = bool
  default     = false
}
