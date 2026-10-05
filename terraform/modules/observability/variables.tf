variable "project" {
  type = string
}

variable "environment" {
  type = string
}

variable "alert_email" {
  description = "Email que recebe as notificações do SNS (precisa confirmar a inscrição clicando no link do email de confirmação)."
  type        = string
}

variable "ecs_cluster_name" {
  type = string
}

variable "ecs_service_name" {
  type = string
}

variable "alb_arn_suffix" {
  description = "Output 'alb_arn_suffix' do módulo 'compute' — dimensão dos alarmes AWS/ApplicationELB."
  type        = string
}

variable "db_instance_identifier" {
  description = "Output 'db_instance_identifier' do módulo 'database' — dimensão dos alarmes AWS/RDS."
  type        = string
}

# Limiares pensados pro porte real do sistemanex (B2B fiscal, tráfego
# baixo/moderado) — não os defaults de hyperscale que a maioria dos
# exemplos por aí usa. O objetivo é alarme que dispara quando importa,
# sem acordar ninguém de madrugada por ruído.

variable "ecs_cpu_high_threshold" {
  type    = number
  default = 80
}

variable "ecs_memory_high_threshold" {
  type    = number
  default = 80
}

variable "alb_5xx_count_threshold" {
  description = "Contagem absoluta de 5xx por período (não taxa) — em baixo volume de tráfego, um alarme por % seria ruidoso/sem sentido."
  type        = number
  default     = 10
}

variable "alb_p99_latency_threshold_seconds" {
  type    = number
  default = 2
}

variable "rds_cpu_high_threshold" {
  type    = number
  default = 80
}

variable "rds_free_storage_threshold_bytes" {
  description = "10 GiB em bytes."
  type        = number
  default     = 10737418240
}

variable "rds_connections_threshold" {
  type    = number
  default = 80
}

# Período/evaluation_periods padrão (5 min x 2 = 10 min pra confirmar antes
# de alarmar) servem de base pra maioria dos alarmes deste módulo; exceções
# pontuais (ex.: 5xx) são tratadas localmente no main.tf.

variable "alarm_period_seconds" {
  type    = number
  default = 300
}

variable "alarm_evaluation_periods" {
  type    = number
  default = 2
}
