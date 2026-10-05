output "endpoint" {
  value = aws_db_instance.this.address
}

output "port" {
  value = aws_db_instance.this.port
}

output "security_group_id" {
  value = aws_security_group.rds.id
}

output "database_url_secret_arn" {
  description = "ARN do segredo no Secrets Manager contendo a DATABASE_URL completa."
  value       = aws_secretsmanager_secret.database_url.arn
}

output "arn" {
  description = "ARN da instância RDS — usado pelo módulo 'backup' (aws_backup_selection) pra selecionar o recurso a proteger."
  value       = aws_db_instance.this.arn
}

output "db_instance_identifier" {
  description = "Identifier da instância RDS — usado como dimensão nos alarmes CloudWatch (AWS/RDS usa DBInstanceIdentifier, não o ARN)."
  value       = aws_db_instance.this.identifier
}
