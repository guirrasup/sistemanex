# ECS Fargate rodando o backend (API), atrás de um ALB. O frontend (SPA)
# NÃO roda aqui — vai pro módulo "edge" (S3 + CloudFront), separado da API.

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

  fixed_secrets = {
    DATABASE_URL               = var.database_url_secret_arn
    JWT_SECRET                 = var.jwt_secret_arn
    CERTIFICADO_ENCRYPTION_KEY = var.certificado_encryption_key_arn
  }

  conectagov_secrets = {
    for k, v in {
      CONECTAGOV_CLIENT_ID     = lookup(var.conectagov_secret_arns, "client_id", null)
      CONECTAGOV_CLIENT_SECRET = lookup(var.conectagov_secret_arns, "client_secret", null)
      CONECTAGOV_CPF_USUARIO   = lookup(var.conectagov_secret_arns, "cpf_usuario", null)
      CONECTAGOV_PRIVATE_KEY   = lookup(var.conectagov_secret_arns, "private_key", null)
    } : k => v if v != null
  }

  all_secret_arns   = merge(local.fixed_secrets, var.ssm_parameters, local.conectagov_secrets)
  container_secrets = [for name, arn in local.all_secret_arns : { name = name, valueFrom = arn }]
}

# ---------------------------------------------------------------------------
# ECR + logs
# ---------------------------------------------------------------------------

resource "aws_ecr_repository" "backend" {
  name                 = "${local.name}-backend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/${local.name}-backend"
  retention_in_days = 30
}

# ---------------------------------------------------------------------------
# Security groups
# ---------------------------------------------------------------------------

resource "aws_security_group" "alb" {
  name = "${local.name}-alb"
  # GroupDescription da EC2 Security Group só aceita ASCII (restrição antiga
  # da API, não é algo que dá pra contornar) — texto sem acento de propósito.
  description = "Entrada publica HTTP/HTTPS pro ALB."
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  dynamic "ingress" {
    for_each = var.acm_certificate_arn != "" ? [443] : []
    content {
      from_port   = ingress.value
      to_port     = ingress.value
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${local.name}-alb" }
}

resource "aws_security_group" "ecs_tasks" {
  name = "${local.name}-ecs-tasks"
  # ASCII only - ver comentário no SG "alb" acima.
  description = "So aceita trafego do ALB; egresso livre (precisa alcancar SEFAZ/ConectaGov na internet via NAT)."
  vpc_id      = var.vpc_id

  ingress {
    from_port       = var.container_port
    to_port         = var.container_port
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${local.name}-ecs-tasks" }
}

# Libera as tasks do ECS no security group do RDS (criado no módulo database,
# referenciado aqui por id — o módulo database não conhece o SG do ECS na
# hora em que é aplicado, por isso essa regra mora aqui).
resource "aws_security_group_rule" "ecs_to_rds" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  security_group_id        = var.rds_security_group_id
  source_security_group_id = aws_security_group.ecs_tasks.id
}

# ---------------------------------------------------------------------------
# IAM
# ---------------------------------------------------------------------------

data "aws_iam_policy_document" "ecs_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "execution" {
  name               = "${local.name}-ecs-execution"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume.json
}

resource "aws_iam_role_policy_attachment" "execution_managed" {
  role       = aws_iam_role.execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Permissão pra buscar os segredos/parâmetros referenciados na task
# definition no momento do boot do container (é a execution role quem faz
# isso, não a task role).
data "aws_iam_policy_document" "execution_secrets" {
  # fixed_secrets nunca é vazio (DATABASE_URL/JWT_SECRET/CERTIFICADO_ENCRYPTION_KEY
  # sempre existem); conectagov_secrets pode ser {} até as credenciais reais
  # chegarem — merge() com um mapa vazio é só um no-op, sem precisar de
  # nenhuma condição especial pra esse caso.
  statement {
    actions   = ["secretsmanager:GetSecretValue"]
    resources = values(merge(local.fixed_secrets, local.conectagov_secrets))
  }
  statement {
    actions   = ["ssm:GetParameters"]
    resources = values(var.ssm_parameters)
  }
}

resource "aws_iam_role_policy" "execution_secrets" {
  name   = "${local.name}-read-secrets"
  role   = aws_iam_role.execution.id
  policy = data.aws_iam_policy_document.execution_secrets.json
}

resource "aws_iam_role" "task" {
  name               = "${local.name}-ecs-task"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume.json
}

# ---------------------------------------------------------------------------
# ALB
# ---------------------------------------------------------------------------

resource "aws_lb" "this" {
  name               = "${local.name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = var.public_subnet_ids

  # Opt-in (var.access_logs_enabled, bool literal — nunca unknown no plan).
  dynamic "access_logs" {
    for_each = var.access_logs_enabled ? [1] : []
    content {
      bucket  = aws_s3_bucket.alb_logs[0].bucket
      enabled = true
    }
  }
}

# Access logs do ALB — opt-in (var.access_logs_enabled). Bucket dedicado
# (não reaproveita nenhum outro bucket do projeto) porque o ELB exige uma
# bucket policy MUITO específica (principal é a conta de serviço regional
# do Elastic Load Balancing, não um service principal comum).
resource "aws_s3_bucket" "alb_logs" {
  count  = var.access_logs_enabled ? 1 : 0
  bucket = "${local.name}-alb-logs"
}

resource "aws_s3_bucket_public_access_block" "alb_logs" {
  count                   = var.access_logs_enabled ? 1 : 0
  bucket                  = aws_s3_bucket.alb_logs[0].id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "alb_logs" {
  count  = var.access_logs_enabled ? 1 : 0
  bucket = aws_s3_bucket.alb_logs[0].id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# A conta de serviço do ELB varia por região — us-east-1 usa 127311923021
# (lista oficial da AWS em "Enable access logging for your Application Load
# Balancer" > "Required Amazon S3 bucket permissions"). Documentar isso
# explicitamente porque, se este módulo algum dia for usado em outra região,
# esse número PRECISA mudar junto (ex: sa-east-1 usa 507241528517).
data "aws_iam_policy_document" "alb_logs" {
  count = var.access_logs_enabled ? 1 : 0

  statement {
    sid    = "ELBAccountWrite"
    effect = "Allow"
    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::127311923021:root"]
    }
    actions   = ["s3:PutObject"]
    resources = ["${aws_s3_bucket.alb_logs[0].arn}/*"]
  }

  statement {
    sid    = "ELBLogDeliveryWrite"
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["logdelivery.elasticloadbalancing.amazonaws.com"]
    }
    actions   = ["s3:PutObject"]
    resources = ["${aws_s3_bucket.alb_logs[0].arn}/*"]
    condition {
      test     = "StringEquals"
      variable = "s3:x-amz-acl"
      values   = ["bucket-owner-full-control"]
    }
  }
}

resource "aws_s3_bucket_policy" "alb_logs" {
  count  = var.access_logs_enabled ? 1 : 0
  bucket = aws_s3_bucket.alb_logs[0].id
  policy = data.aws_iam_policy_document.alb_logs[0].json
}

resource "aws_lb_target_group" "backend" {
  name        = "${local.name}-backend"
  port        = var.container_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    path                = "/health"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 30
    timeout             = 5
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.this.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    # Sem HTTPS: se o origin-verify estiver ligado, o tráfego direto (sem
    # passar pelo CloudFront/WAF) leva 403 — só a listener rule com o header
    # secreto é encaminhada pro target group.
    #
    # IMPORTANTE: a condição usa var.origin_verify_enabled (bool conhecido
    # no plan), NUNCA var.origin_verify_secret_value != "" — o valor do
    # secret normalmente vem de um random_password ainda não aplicado
    # (unknown no plan), e count/for_each/type não podem depender de um
    # valor unknown. origin_verify_secret_value entra só dentro do
    # "condition.http_header.values" abaixo, onde um valor unknown é OK.
    type = var.acm_certificate_arn != "" ? "redirect" : (var.origin_verify_enabled ? "fixed-response" : "forward")

    dynamic "redirect" {
      for_each = var.acm_certificate_arn != "" ? [1] : []
      content {
        port        = "443"
        protocol    = "HTTPS"
        status_code = "HTTP_301"
      }
    }

    dynamic "fixed_response" {
      for_each = var.acm_certificate_arn == "" && var.origin_verify_enabled ? [1] : []
      content {
        status_code  = "403"
        content_type = "text/plain"
        message_body = "Forbidden"
      }
    }

    target_group_arn = var.acm_certificate_arn == "" && !var.origin_verify_enabled ? aws_lb_target_group.backend.arn : null
  }
}

resource "aws_lb_listener" "https" {
  count             = var.acm_certificate_arn != "" ? 1 : 0
  load_balancer_arn = aws_lb.this.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.acm_certificate_arn

  default_action {
    # Mesma lógica do listener HTTP: sem o header secreto do CloudFront, 403.
    type = var.origin_verify_enabled ? "fixed-response" : "forward"

    dynamic "fixed_response" {
      for_each = var.origin_verify_enabled ? [1] : []
      content {
        status_code  = "403"
        content_type = "text/plain"
        message_body = "Forbidden"
      }
    }

    target_group_arn = var.origin_verify_enabled ? null : aws_lb_target_group.backend.arn
  }
}

# Regras que furam o fixed-response 403 acima quando a request carrega o
# header secreto — é assim que o CloudFront (ou qualquer front confiável)
# prova que não veio direto da internet.
resource "aws_lb_listener_rule" "origin_verify_http" {
  count        = var.acm_certificate_arn == "" && var.origin_verify_enabled ? 1 : 0
  listener_arn = aws_lb_listener.http.arn
  priority     = 1

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }

  condition {
    http_header {
      http_header_name = var.origin_verify_header_name
      values           = [var.origin_verify_secret_value]
    }
  }
}

resource "aws_lb_listener_rule" "origin_verify_https" {
  count        = var.acm_certificate_arn != "" && var.origin_verify_enabled ? 1 : 0
  listener_arn = aws_lb_listener.https[0].arn
  priority     = 1

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }

  condition {
    http_header {
      http_header_name = var.origin_verify_header_name
      values           = [var.origin_verify_secret_value]
    }
  }
}

# ---------------------------------------------------------------------------
# ECS
# ---------------------------------------------------------------------------

resource "aws_ecs_cluster" "this" {
  name = local.name

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_ecs_task_definition" "backend" {
  family                   = "${local.name}-backend"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.task_cpu
  memory                   = var.task_memory
  execution_role_arn       = aws_iam_role.execution.arn
  task_role_arn            = aws_iam_role.task.arn

  container_definitions = jsonencode([
    {
      name      = "backend"
      image     = "${aws_ecr_repository.backend.repository_url}:${var.image_tag}"
      essential = true
      portMappings = [
        {
          containerPort = var.container_port
          protocol      = "tcp"
        }
      ]
      environment = [
        { name = "NODE_ENV", value = var.environment == "prod" ? "production" : "development" }
      ]
      secrets = local.container_secrets
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.backend.name
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "backend"
        }
      }
    }
  ])
}

data "aws_region" "current" {}

locals {
  # "ignore_changes" exige uma lista estática no parse (não aceita um
  # ternário escolhendo entre duas listas, mesmo as duas sendo estáticas) —
  # por isso o service vira dois recursos mutuamente exclusivos via count,
  # idênticos exceto no lifecycle, em vez de um só com ignore_changes
  # condicional. Ver module.compute.ecs_service_name/_arn nos outputs e o
  # aws_appautoscaling_target abaixo pra como as duas pontas são resolvidas.
  ecs_service_common = {
    name            = "${local.name}-backend"
    cluster         = aws_ecs_cluster.this.id
    task_definition = aws_ecs_task_definition.backend.arn
    desired_count   = var.desired_count
  }
}

# Service "normal": usado quando autoscaling está desligado (dev) — desired_count
# continua 100% gerenciado pelo Terraform, exatamente como antes desta mudança.
resource "aws_ecs_service" "backend" {
  count           = var.autoscaling_enabled ? 0 : 1
  name            = local.ecs_service_common.name
  cluster         = local.ecs_service_common.cluster
  task_definition = local.ecs_service_common.task_definition
  desired_count   = local.ecs_service_common.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = var.private_subnet_ids
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "backend"
    container_port   = var.container_port
  }

  # Evita que o Terraform tente "corrigir" de volta a tag de imagem toda vez
  # que o pipeline de CI/CD faz deploy via update-service fora do Terraform.
  lifecycle {
    ignore_changes = [task_definition]
  }

  # O target group só fica de fato associado ao ALB através de QUALQUER UM
  # destes (depende da combinação acm_certificate_arn x origin_verify_enabled
  # — ver aws_lb_listener.http/.https acima): o listener HTTP, o listener
  # HTTPS (quando existe), ou uma das listener rules de origin-verify (quando
  # o default_action vira fixed-response e deixa de apontar pro target
  # group). Sem esperar por todos, o ECS pode tentar criar o service antes
  # da associação existir e falhar com "target group does not have an
  # associated load balancer" numa corrida.
  depends_on = [
    aws_lb_listener.http,
    aws_lb_listener.https,
    aws_lb_listener_rule.origin_verify_http,
    aws_lb_listener_rule.origin_verify_https,
  ]
}

# Service "autoscalado": usado quando autoscaling está ligado (prod) — mesma
# definição, só que desired_count também é ignorado pelo Terraform, porque
# quem manda nele a partir daqui é o Application Auto Scaling.
resource "aws_ecs_service" "backend_autoscaled" {
  count           = var.autoscaling_enabled ? 1 : 0
  name            = local.ecs_service_common.name
  cluster         = local.ecs_service_common.cluster
  task_definition = local.ecs_service_common.task_definition
  desired_count   = local.ecs_service_common.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = var.private_subnet_ids
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "backend"
    container_port   = var.container_port
  }

  lifecycle {
    ignore_changes = [task_definition, desired_count]
  }

  # O target group só fica de fato associado ao ALB através de QUALQUER UM
  # destes (depende da combinação acm_certificate_arn x origin_verify_enabled
  # — ver aws_lb_listener.http/.https acima): o listener HTTP, o listener
  # HTTPS (quando existe), ou uma das listener rules de origin-verify (quando
  # o default_action vira fixed-response e deixa de apontar pro target
  # group). Sem esperar por todos, o ECS pode tentar criar o service antes
  # da associação existir e falhar com "target group does not have an
  # associated load balancer" numa corrida.
  depends_on = [
    aws_lb_listener.http,
    aws_lb_listener.https,
    aws_lb_listener_rule.origin_verify_http,
    aws_lb_listener_rule.origin_verify_https,
  ]
}

# ---------------------------------------------------------------------------
# ECS autoscaling (opt-in — ver var.autoscaling_enabled)
# ---------------------------------------------------------------------------

resource "aws_appautoscaling_target" "ecs_backend" {
  count              = var.autoscaling_enabled ? 1 : 0
  max_capacity       = var.autoscaling_max_capacity
  min_capacity       = var.autoscaling_min_capacity
  resource_id        = "service/${aws_ecs_cluster.this.name}/${aws_ecs_service.backend_autoscaled[0].name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "ecs_cpu" {
  count              = var.autoscaling_enabled ? 1 : 0
  name               = "${local.name}-cpu-target-tracking"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs_backend[0].resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_backend[0].scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_backend[0].service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = var.autoscaling_cpu_target_value
    scale_out_cooldown = var.autoscaling_scale_out_cooldown
    scale_in_cooldown  = var.autoscaling_scale_in_cooldown
  }
}

resource "aws_appautoscaling_policy" "ecs_requests" {
  count              = var.autoscaling_enabled ? 1 : 0
  name               = "${local.name}-requests-target-tracking"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs_backend[0].resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_backend[0].scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_backend[0].service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ALBRequestCountPerTarget"
      resource_label         = "${aws_lb.this.arn_suffix}/${aws_lb_target_group.backend.arn_suffix}"
    }
    target_value       = var.autoscaling_request_count_target
    scale_out_cooldown = var.autoscaling_scale_out_cooldown
    scale_in_cooldown  = var.autoscaling_scale_in_cooldown
  }
}
