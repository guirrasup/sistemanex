# Permite que o GitHub Actions assuma uma IAM Role temporária via OIDC — SEM
# chave de longa duração guardada em secret do GitHub, e SEM precisar de um
# runner self-hosted com acesso direto à infra (o problema de segurança que
# tínhamos antes: o runner rodava na própria VM de produção).
#
# A trust policy abaixo só permite esta role ser assumida por workflows
# rodando NA branch configurada (var.github_branch) deste repositório
# específico — um PR de fora, ou um push numa branch diferente, não
# consegue assumir a role.

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

locals {
  name = "${var.project}-${var.environment}"

  # Thumbprints conhecidos da CA usada pelo token.actions.githubusercontent.com
  # (a AWS valida contra seu próprio trust store pra provedores OIDC
  # conhecidos, mas o argumento ainda é obrigatório no recurso).
  github_oidc_thumbprints = [
    "6938fd4d98bab03faadb97b34396831e3780aea1",
    "1c58a3a8518e8759bf075b76b750d4f2df264fcd",
  ]
}

resource "aws_iam_openid_connect_provider" "github" {
  count = var.create_oidc_provider ? 1 : 0

  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = local.github_oidc_thumbprints
}

locals {
  oidc_provider_arn = var.create_oidc_provider ? aws_iam_openid_connect_provider.github[0].arn : var.existing_oidc_provider_arn
}

data "aws_iam_policy_document" "trust" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [local.oidc_provider_arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    # Escopo estreito de propósito: só este GitHub Environment, deste repo,
    # pode assumir. StringLike (não StringEquals) por causa do "@*" — o sub
    # inclui os IDs numéricos imutáveis de owner/repo
    # ("repo:guirrasup@149546320/sistemanex@1330964651:environment:dev"),
    # não só o nome — ver comentário na variável github_environment pra como
    # isso foi descoberto.
    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_org}@*/${var.github_repo}@*:environment:${var.github_environment}"]
    }
  }
}

resource "aws_iam_role" "deploy" {
  name               = "${local.name}-github-deploy"
  assume_role_policy = data.aws_iam_policy_document.trust.json

  # Sessões de deploy são curtas por natureza — não precisa de mais que isso.
  max_session_duration = 3600
}

data "aws_iam_policy_document" "deploy" {
  statement {
    sid = "ECRAuth"
    actions = [
      "ecr:GetAuthorizationToken",
    ]
    resources = ["*"] # GetAuthorizationToken não aceita resource scoping
  }

  statement {
    sid = "ECRPush"
    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:PutImage",
      "ecr:InitiateLayerUpload",
      "ecr:UploadLayerPart",
      "ecr:CompleteLayerUpload",
      "ecr:BatchGetImage",
    ]
    resources = [var.ecr_repository_arn]
  }

  statement {
    # ecs:cluster só existe como chave de condição pra ações no escopo de um
    # cluster (UpdateService/DescribeServices) — por isso fica numa statement
    # separada da de task definition logo abaixo.
    sid = "ECSClusterScoped"
    actions = [
      "ecs:UpdateService",
      "ecs:DescribeServices",
    ]
    resources = ["*"]
    condition {
      test     = "ArnEquals"
      variable = "ecs:cluster"
      values   = [var.ecs_cluster_arn]
    }
  }

  statement {
    # RegisterTaskDefinition cria uma revisão nova (não tem ARN prévio pra
    # restringir) e DescribeTaskDefinition não aceita a condição ecs:cluster
    # — deixado sem resource scoping, como a própria AWS documenta pra este
    # par de ações.
    sid = "ECSTaskDefinition"
    actions = [
      "ecs:DescribeTaskDefinition",
      "ecs:RegisterTaskDefinition",
    ]
    resources = ["*"]
  }

  statement {
    sid       = "PassExecutionRoles"
    actions   = ["iam:PassRole"]
    resources = [var.ecs_task_execution_role_arn, var.ecs_task_role_arn]
    condition {
      test     = "StringEquals"
      variable = "iam:PassedToService"
      values   = ["ecs-tasks.amazonaws.com"]
    }
  }

  statement {
    sid       = "FrontendSync"
    actions   = ["s3:ListBucket"]
    resources = [var.frontend_bucket_arn]
  }

  statement {
    sid       = "FrontendSyncObjects"
    actions   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
    resources = ["${var.frontend_bucket_arn}/*"]
  }

  statement {
    sid       = "CloudFrontInvalidate"
    actions   = ["cloudfront:CreateInvalidation"]
    resources = [var.cloudfront_distribution_arn]
  }

  statement {
    # Task one-off pra rodar "npx prisma migrate deploy" antes do update do
    # service — substitui o "docker compose exec backend npx prisma migrate
    # deploy" do scripts/deploy.sh antigo.
    sid       = "ECSRunMigrationTask"
    actions   = ["ecs:RunTask"]
    resources = ["*"]
    condition {
      test     = "ArnEquals"
      variable = "ecs:cluster"
      values   = [var.ecs_cluster_arn]
    }
  }

  statement {
    sid       = "ECSDescribeWaitTasks"
    actions   = ["ecs:DescribeTasks"]
    resources = ["*"]
    condition {
      test     = "ArnEquals"
      variable = "ecs:cluster"
      values   = [var.ecs_cluster_arn]
    }
  }
}

resource "aws_iam_role_policy" "deploy" {
  name   = "${local.name}-deploy"
  role   = aws_iam_role.deploy.id
  policy = data.aws_iam_policy_document.deploy.json
}
