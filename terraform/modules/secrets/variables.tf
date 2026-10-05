variable "project" {
  type = string
}

variable "environment" {
  type = string
}

variable "frontend_url" {
  type    = string
  default = "http://localhost"
}

variable "seed_ambiente" {
  type    = string
  default = "HOMOLOGACAO"
}

# Credenciais do ConectaGov — não geradas pelo Terraform (vêm de fora, do
# portal do governo). Passar via -var ou um .tfvars NÃO versionado
# (terraform/environments/*/secrets.auto.tfvars, já coberto pelo
# .gitignore da raiz do projeto).
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
