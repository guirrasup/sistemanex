variable "project" {
  description = "Nome do projeto, usado em tags e nomes de recursos."
  type        = string
}

variable "environment" {
  description = "Nome do ambiente (dev, prod)."
  type        = string
}

variable "vpc_cidr" {
  description = "Bloco CIDR da VPC."
  type        = string
  default     = "10.0.0.0/16"
}

variable "azs" {
  description = "Availability Zones a usar (2 é o mínimo pro RDS Multi-AZ e pro ALB)."
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

variable "single_nat_gateway" {
  description = "true = 1 NAT Gateway só (mais barato, ponto único de falha de saída); false = 1 por AZ (produção)."
  type        = bool
  default     = true
}

variable "flow_logs_enabled" {
  description = "Liga VPC Flow Logs (tráfego de rede pra CloudWatch Logs) — desligado por padrão (dev); ligar em prod pra auditoria/segurança."
  type        = bool
  default     = false
}

variable "flow_logs_retention_days" {
  type    = number
  default = 30
}
