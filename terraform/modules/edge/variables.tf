variable "project" {
  type = string
}

variable "environment" {
  type = string
}

variable "domain_name" {
  description = "Domínio final (ex: app.sistemanex.com.br). Precisa existir mesmo que o DNS ainda não aponte pra cá."
  type        = string
}

variable "alb_dns_name" {
  description = "DNS do ALB (módulo compute) — vira o origin de /api/* no CloudFront."
  type        = string
}

variable "alb_https_enabled" {
  description = "true se o ALB já tem um listener HTTPS (ACM anexado nele); false = CloudFront fala com o ALB só por HTTP (aceitável dentro da rede da AWS, mas troque assim que puder)."
  type        = bool
  default     = false
}

variable "wait_for_validation" {
  description = "Ligue depois de ter criado o registro CNAME de validação no Cloudflare — faz o apply esperar o ACM confirmar antes de seguir. Deixe false no primeiro apply (senão o terraform fica preso esperando um DNS que ainda não existe)."
  type        = bool
  default     = false
}

variable "web_acl_arn" {
  description = "ARN do WAFv2 Web ACL (scope=CLOUDFRONT, criado em us-east-1) — opcional pra manter o módulo usável sem WAF em ambientes mais baratos (dev). Null = sem WAF."
  type        = string
  default     = null
}

variable "origin_verify_enabled" {
  description = "Liga o envio do header secreto pro ALB. Separado de origin_verify_secret_value de propósito — ver mesma variável no módulo 'compute'."
  type        = bool
  default     = false
}

variable "origin_verify_header_name" {
  description = "Nome do header secreto mandado pro ALB de origem — mesmo valor passado ao módulo 'compute'."
  type        = string
  default     = "X-Origin-Verify"
}

variable "origin_verify_secret_value" {
  description = "Valor secreto do header — só é enviado quando origin_verify_enabled=true."
  type        = string
  sensitive   = true
  default     = ""
}

variable "access_logs_enabled" {
  description = "Liga access logs do CloudFront pra um bucket S3 dedicado — desligado por padrão (dev); ligar em prod pra auditoria."
  type        = bool
  default     = false
}
