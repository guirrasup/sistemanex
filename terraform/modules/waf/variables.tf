variable "project" { type = string }
variable "environment" { type = string }
variable "rate_limit_per_5min" {
  description = "Máximo de requests por IP em 5 min antes de bloquear. 2000 é folgado pro tráfego B2B deste sistema."
  type        = number
  default     = 2000
}
