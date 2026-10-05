variable "project" {
  type = string
}

variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "allowed_security_group_ids" {
  description = "Security groups que podem se conectar na porta 5432 (ex: SG das tasks do ECS)."
  type        = list(string)
  default     = []
}

variable "instance_class" {
  description = "db.t4g.micro chega sobrando pro dev; produção provavelmente quer t4g.small ou maior."
  type        = string
  default     = "db.t4g.micro"
}

variable "allocated_storage" {
  description = "Armazenamento inicial em GB (gp3 cresce sozinho até max_allocated_storage se precisar)."
  type        = number
  default     = 20
}

variable "max_allocated_storage" {
  type    = number
  default = 100
}

variable "engine_version" {
  type    = string
  default = "16"
}

variable "db_name" {
  type    = string
  default = "nex_erp"
}

variable "master_username" {
  type    = string
  default = "nex_user"
}

variable "multi_az" {
  description = "Produção deveria ligar isso; dev pode ficar false pra economizar."
  type        = bool
  default     = false
}

variable "backup_retention_days" {
  type    = number
  default = 7
}

variable "deletion_protection" {
  description = "Trava contra 'terraform destroy'/console apagando o banco por engano — ligar em prod."
  type        = bool
  default     = false
}
