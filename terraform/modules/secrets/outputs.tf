output "jwt_secret_arn" {
  value = aws_secretsmanager_secret.jwt_secret.arn
}

output "certificado_encryption_key_arn" {
  value = aws_secretsmanager_secret.certificado_encryption_key.arn
}

output "ssm_parameters" {
  description = "Mapa NOME_DA_ENV_VAR => ARN, pronto pro bloco 'secrets' da task definition do ECS."
  value = {
    PORT          = aws_ssm_parameter.port.arn
    FRONTEND_URL  = aws_ssm_parameter.frontend_url.arn
    SEED_AMBIENTE = aws_ssm_parameter.seed_ambiente.arn
  }
}

output "conectagov_secret_arns" {
  description = "Mapa das ARNs dos segredos do ConectaGov que foram de fato criados (vazio até as credenciais reais serem fornecidas)."
  value = {
    client_id     = try(aws_secretsmanager_secret.conectagov_client_id[0].arn, null)
    client_secret = try(aws_secretsmanager_secret.conectagov_client_secret[0].arn, null)
    cpf_usuario   = try(aws_secretsmanager_secret.conectagov_cpf_usuario[0].arn, null)
    private_key   = try(aws_secretsmanager_secret.conectagov_private_key[0].arn, null)
  }
}
