variable "project" {
  type    = string
  default = "sistemanex"
}

variable "region" {
  type    = string
  default = "us-east-1"
}

variable "domain_name" {
  description = "Domínio do frontend de produção. Confirmar com o time antes do 1º apply (convenção usada: dev.sistemanex.com.br para dev, app.sistemanex.com.br para prod)."
  type        = string
  default     = "app.sistemanex.com.br"
}

variable "image_tag" {
  type    = string
  default = "latest"
}

# ConectaGov — nunca commitar valores reais. Preencher via
# terraform/environments/prod/secrets.auto.tfvars (gitignored) ou -var.
variable "conectagov_client_id" {
  type      = string
  sensitive = true
  default   = ""
}
variable "conectagov_client_secret" {
  type      = string
  sensitive = true
  default   = ""
}
variable "conectagov_cpf_usuario" {
  type      = string
  sensitive = true
  default   = ""
}
variable "conectagov_private_key" {
  type      = string
  sensitive = true
  default   = ""
}

variable "wait_for_validation" {
  description = "false no primeiro apply; true depois de criar o CNAME de validação do ACM no Cloudflare."
  type        = bool
  default     = false
}

variable "alert_email" {
  description = "Email que recebe os alarmes do CloudWatch via SNS — precisa confirmar a inscrição clicando no link do email de confirmação depois do 1º apply."
  type        = string
}
