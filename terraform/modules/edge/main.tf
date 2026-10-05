# Frontend (SPA) em S3 + CloudFront, com /api/* roteado pro ALB do backend —
# mantém o mesmo padrão que o app já espera hoje (VITE_API_URL=/api, mesma
# origem), só que agora servido por CDN em vez do próprio nginx do backend.
#
# O certificado ACM TEM que ser criado em us-east-1 (exigência do CloudFront,
# não importa a região do resto da infra) — por isso o provider alias
# "aws.us_east_1" é obrigatório; quem instancia este módulo precisa declarar
# um provider adicional apontando pra us-east-1 e passar via "providers = {}".
#
# DNS é gerenciado no Cloudflare, não no Route53 — a validação do ACM
# precisa de uma ação manual (ver output "acm_validation_records") antes do
# certificado ficar "ISSUED".

terraform {
  required_providers {
    aws = {
      source                = "hashicorp/aws"
      version               = "~> 5.0"
      configuration_aliases = [aws.us_east_1]
    }
  }
}

locals {
  name = "${var.project}-${var.environment}"
}

resource "aws_s3_bucket" "frontend" {
  bucket = "${local.name}-frontend"
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket                  = aws_s3_bucket.frontend.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_cloudfront_origin_access_control" "frontend" {
  name                              = "${local.name}-frontend"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# Só o CloudFront (via OAC) pode ler do bucket — não existe URL pública
# direta do S3.
data "aws_iam_policy_document" "frontend_bucket" {
  count = var.wait_for_validation ? 1 : 0

  statement {
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.frontend.arn}/*"]
    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.this[0].arn]
    }
  }
}

# Também só existe depois que a distribuição existe — antes disso o bucket
# fica sem policy (privado por padrão via public_access_block, o que já é
# seguro; só não é lido por ninguém até a 1ª distribuição ser criada).
resource "aws_s3_bucket_policy" "frontend" {
  count  = var.wait_for_validation ? 1 : 0
  bucket = aws_s3_bucket.frontend.id
  policy = data.aws_iam_policy_document.frontend_bucket[0].json
}

# Access logs do CloudFront — opt-in (var.access_logs_enabled). Bucket
# dedicado (separado do bucket do frontend) porque o mecanismo clássico de
# logging do CloudFront exige ACL habilitada no bucket (grant pro grupo
# "awslogsdelivery"), algo que o bucket do frontend propositalmente NÃO tem
# (fica 100% fechado, só o CloudFront via OAC lê de lá).
resource "aws_s3_bucket" "logs" {
  count  = var.access_logs_enabled ? 1 : 0
  bucket = "${local.name}-cloudfront-logs"
}

resource "aws_s3_bucket_ownership_controls" "logs" {
  count  = var.access_logs_enabled ? 1 : 0
  bucket = aws_s3_bucket.logs[0].id
  rule {
    # BucketOwnerPreferred (não "Enforced"/sem ACL) é exigido aqui: o
    # mecanismo clássico de access logging do CloudFront escreve via ACL,
    # não via bucket policy — "Enforced" quebraria a entrega de logs.
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_public_access_block" "logs" {
  count                   = var.access_logs_enabled ? 1 : 0
  bucket                  = aws_s3_bucket.logs[0].id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# aws_s3_bucket (provider v5) não exporta mais um atributo "owner" (isso só
# existia antes do provider quebrar o recurso em vários menores no v4) — o ID
# canônico do dono do bucket (a própria conta AWS) vem daqui.
data "aws_canonical_user_id" "current" {
  count = var.access_logs_enabled ? 1 : 0
}

resource "aws_s3_bucket_acl" "logs" {
  count      = var.access_logs_enabled ? 1 : 0
  depends_on = [aws_s3_bucket_ownership_controls.logs]
  bucket     = aws_s3_bucket.logs[0].id

  access_control_policy {
    owner {
      id = data.aws_canonical_user_id.current[0].id
    }

    grant {
      grantee {
        type = "Group"
        uri  = "http://acs.amazonaws.com/groups/global/LogDelivery"
      }
      permission = "WRITE"
    }

    grant {
      grantee {
        type = "Group"
        uri  = "http://acs.amazonaws.com/groups/global/LogDelivery"
      }
      permission = "READ_ACP"
    }

    grant {
      grantee {
        type = "CanonicalUser"
        id   = data.aws_canonical_user_id.current[0].id
      }
      permission = "FULL_CONTROL"
    }
  }
}

resource "aws_acm_certificate" "this" {
  provider          = aws.us_east_1
  domain_name       = var.domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate_validation" "this" {
  count           = var.wait_for_validation ? 1 : 0
  provider        = aws.us_east_1
  certificate_arn = aws_acm_certificate.this.arn
}

resource "aws_cloudfront_distribution" "this" {
  # O CloudFront recusa um certificado ainda PENDING_VALIDATION — por isso a
  # distribuição inteira só existe depois que a validação (dependente de
  # você ter criado o CNAME no Cloudflare e rodado apply de novo com
  # wait_for_validation=true) terminou. Primeiro apply: cria só o
  # certificado + bucket e para por aqui (ver output acm_validation_records).
  count = var.wait_for_validation ? 1 : 0

  enabled         = true
  is_ipv6_enabled = true
  aliases         = [var.domain_name]
  price_class     = "PriceClass_100" # Américas + Europa — suficiente pro público-alvo (Brasil); mais barato que "All"
  web_acl_id      = var.web_acl_arn

  # Access logs — opt-in (var.access_logs_enabled, default false em dev). O
  # for_each depende só desse bool, sempre conhecido no plan (nunca de algo
  # que possa ser unknown, tipo um atributo do bucket de logs).
  dynamic "logging_config" {
    for_each = var.access_logs_enabled ? [1] : []
    content {
      bucket          = aws_s3_bucket.logs[0].bucket_domain_name
      prefix          = "cloudfront/"
      include_cookies = false
    }
  }

  origin {
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id                = "frontend-s3"
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
  }

  origin {
    domain_name = var.alb_dns_name
    origin_id   = "backend-alb"
    custom_origin_config {
      origin_protocol_policy = var.alb_https_enabled ? "https-only" : "http-only"
      http_port              = 80
      https_port             = 443
      origin_ssl_protocols   = ["TLSv1.2"]
    }

    # for_each usa var.origin_verify_enabled (bool literal, sempre conhecido
    # no plan) e NUNCA origin_verify_secret_value != "" — o secret normalmente
    # vem de um random_password ainda não aplicado (unknown no plan), e
    # for_each não pode depender de um valor unknown. O secret em si só entra
    # dentro do "content" abaixo, onde um valor unknown é OK.
    dynamic "custom_header" {
      for_each = var.origin_verify_enabled ? [1] : []
      content {
        name  = var.origin_verify_header_name
        value = var.origin_verify_secret_value
      }
    }
  }

  default_cache_behavior {
    target_origin_id       = "frontend-s3"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/api/*"
    target_origin_id       = "backend-alb"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods         = ["GET", "HEAD"]
    # API não deve ser cacheada — cada request passa direto pro ALB.
    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 0

    forwarded_values {
      query_string = true
      headers      = ["Authorization", "Content-Type", "Accept"]
      cookies {
        forward = "all"
      }
    }
  }

  # SPA: qualquer rota desconhecida (client-side routing) cai no index.html
  # em vez de mostrar o erro 403/404 cru do S3.
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.this[0].certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}
