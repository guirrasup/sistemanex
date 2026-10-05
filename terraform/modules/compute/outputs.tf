output "alb_dns_name" {
  value = aws_lb.this.dns_name
}

output "ecr_repository_url" {
  value = aws_ecr_repository.backend.repository_url
}

output "ecr_repository_arn" {
  value = aws_ecr_repository.backend.arn
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.this.name
}

output "ecs_cluster_arn" {
  value = aws_ecs_cluster.this.arn
}

output "ecs_service_name" {
  # Exatamente um dos dois existe por vez (count mutuamente exclusivo via
  # var.autoscaling_enabled — ver main.tf), daí o ternário em vez de um index
  # fixo.
  value = var.autoscaling_enabled ? aws_ecs_service.backend_autoscaled[0].name : aws_ecs_service.backend[0].name
}

output "ecs_service_arn" {
  # "id" é quem retorna o ARN completo do serviço no provider AWS.
  value = var.autoscaling_enabled ? aws_ecs_service.backend_autoscaled[0].id : aws_ecs_service.backend[0].id
}

output "ecs_task_execution_role_arn" {
  value = aws_iam_role.execution.arn
}

output "ecs_task_role_arn" {
  value = aws_iam_role.task.arn
}

output "ecs_tasks_security_group_id" {
  value = aws_security_group.ecs_tasks.id
}

output "alb_arn_suffix" {
  description = "Usado pelo módulo 'observability' como dimensão dos alarmes CloudWatch do ALB."
  value       = aws_lb.this.arn_suffix
}

output "alb_logs_bucket" {
  description = "Nulo quando access_logs_enabled=false."
  value       = var.access_logs_enabled ? aws_s3_bucket.alb_logs[0].bucket : null
}
