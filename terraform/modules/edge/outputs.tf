output "frontend_bucket" {
  value = aws_s3_bucket.frontend.bucket
}

# Antes da validação: use isto pra criar o CNAME de validação no Cloudflare
# (DNS only / nuvem cinza nesse registro específico, mesmo que o resto do
# domínio fique proxied). Depois de criar o CNAME, rode apply de novo com
# wait_for_validation=true.
output "acm_validation_records" {
  value = [
    for dvo in aws_acm_certificate.this.domain_validation_options : {
      name  = dvo.resource_record_name
      type  = dvo.resource_record_type
      value = dvo.resource_record_value
    }
  ]
}

output "cloudfront_domain_name" {
  description = "Nulo até wait_for_validation=true e a distribuição existir de fato."
  value       = var.wait_for_validation ? aws_cloudfront_distribution.this[0].domain_name : null
}

output "cloudfront_distribution_id" {
  value = var.wait_for_validation ? aws_cloudfront_distribution.this[0].id : null
}

output "frontend_bucket_arn" {
  description = "ARN do bucket S3 do frontend — usado pelo módulo 'cicd' pra dar permissão de sync ao deploy role."
  value       = aws_s3_bucket.frontend.arn
}

output "cloudfront_distribution_arn" {
  description = "ARN da distribution CloudFront — nulo até wait_for_validation=true (mesma condição do output cloudfront_distribution_id já existente)."
  value       = var.wait_for_validation ? aws_cloudfront_distribution.this[0].arn : null
}

output "cloudfront_logs_bucket" {
  description = "Nulo quando access_logs_enabled=false."
  value       = var.access_logs_enabled ? aws_s3_bucket.logs[0].bucket : null
}
