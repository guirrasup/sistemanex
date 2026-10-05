# Outputs do nível do ambiente não são promovidos automaticamente a partir
# dos módulos — sem isto, "terraform output" fica vazio e o runbook do
# terraform/README.md (CNAME de validação do ACM, variáveis do GitHub
# Environment) não dá pra seguir.

output "acm_validation_records" {
  description = "Registros CNAME a criar no Cloudflare (DNS only) antes de reaplicar com wait_for_validation=true."
  value       = module.edge.acm_validation_records
}

output "cloudfront_domain_name" {
  description = "Nulo até wait_for_validation=true. Aponte o domínio final pra cá no Cloudflare."
  value       = module.edge.cloudfront_domain_name
}

output "cloudfront_distribution_id" {
  description = "Cole em CLOUDFRONT_DISTRIBUTION_ID no GitHub Environment 'prod'."
  value       = module.edge.cloudfront_distribution_id
}

output "deploy_role_arn" {
  description = "Cole em AWS_DEPLOY_ROLE_ARN no GitHub Environment 'prod'."
  value       = module.cicd.deploy_role_arn
}

output "private_subnet_ids" {
  description = "Cole (separado por vírgula) em PRIVATE_SUBNET_IDS no GitHub Environment 'prod'."
  value       = module.networking.private_subnet_ids
}

output "ecs_tasks_security_group_id" {
  description = "Cole em ECS_TASKS_SECURITY_GROUP_ID no GitHub Environment 'prod'."
  value       = module.compute.ecs_tasks_security_group_id
}

output "alb_dns_name" {
  value = module.compute.alb_dns_name
}

output "ecr_repository_url" {
  value = module.compute.ecr_repository_url
}

output "frontend_bucket" {
  value = module.edge.frontend_bucket
}

output "sns_topic_arn" {
  description = "Tópico SNS dos alarmes CloudWatch — confirme a inscrição do email (var.alert_email) clicando no link enviado pela AWS."
  value       = module.observability.sns_topic_arn
}

output "backup_vault_arn" {
  value = module.backup.backup_vault_arn
}

output "web_acl_arn" {
  value = module.waf.web_acl_arn
}
