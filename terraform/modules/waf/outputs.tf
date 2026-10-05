output "web_acl_arn" {
  description = "ARN do Web ACL — consumido pelo módulo 'edge' (aws_cloudfront_distribution.web_acl_id)."
  value       = aws_wafv2_web_acl.cloudfront.arn
}
