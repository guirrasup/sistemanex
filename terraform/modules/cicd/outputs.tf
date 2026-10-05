output "deploy_role_arn" {
  description = "Cole isto no workflow do GitHub Actions (permissions.id-token: write + role-to-assume)."
  value       = aws_iam_role.deploy.arn
}

output "oidc_provider_arn" {
  value = local.oidc_provider_arn
}
