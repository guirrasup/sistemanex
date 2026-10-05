# RDS PostgreSQL em subnet privada, senha gerada e guardada no Secrets
# Manager (nunca em tfvars/state em texto puro seria o ideal, mas o
# Terraform precisa conhecer o valor pra criar o recurso — o state fica
# com o valor independente disso, então o backend S3 do bootstrap PRECISA
# estar com encryption + bloqueio de acesso público, o que já está).

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

locals {
  name = "${var.project}-${var.environment}"
}

resource "random_password" "master" {
  length  = 32
  special = false # evita caracteres que precisam de URL-encode na connection string
}

resource "aws_db_subnet_group" "this" {
  name       = "${local.name}-db"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name = "${local.name}-db-subnet-group"
  }
}

resource "aws_security_group" "rds" {
  name = "${local.name}-rds"
  # GroupDescription da EC2 Security Group só aceita ASCII — texto sem acento.
  description = "Permite 5432 so a partir dos security groups explicitamente autorizados."
  vpc_id      = var.vpc_id

  tags = {
    Name = "${local.name}-rds"
  }
}

resource "aws_security_group_rule" "ingress" {
  count                    = length(var.allowed_security_group_ids)
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  security_group_id        = aws_security_group.rds.id
  source_security_group_id = var.allowed_security_group_ids[count.index]
}

resource "aws_security_group_rule" "egress_all" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  security_group_id = aws_security_group.rds.id
  cidr_blocks       = ["0.0.0.0/0"]
}

resource "aws_db_instance" "this" {
  identifier     = local.name
  engine         = "postgres"
  engine_version = var.engine_version

  instance_class        = var.instance_class
  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.max_allocated_storage
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = var.db_name
  username = var.master_username
  password = random_password.master.result

  db_subnet_group_name   = aws_db_subnet_group.this.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  multi_az               = var.multi_az
  publicly_accessible    = false

  backup_retention_period = var.backup_retention_days
  backup_window           = "03:00-04:00" # madrugada em horário de Brasília (UTC-3) ~ 00:00-01:00
  maintenance_window      = "mon:04:00-mon:05:00"

  deletion_protection       = var.deletion_protection
  skip_final_snapshot       = !var.deletion_protection
  final_snapshot_identifier = var.deletion_protection ? "${local.name}-final" : null

  tags = {
    Name        = local.name
    Project     = var.project
    Environment = var.environment
  }
}

# Guarda a connection string pronta no Secrets Manager — é isso que o ECS
# task definition referencia (ver módulo compute), nunca o Terraform state
# diretamente.
resource "aws_secretsmanager_secret" "database_url" {
  name = "${local.name}/DATABASE_URL"
}

resource "aws_secretsmanager_secret_version" "database_url" {
  secret_id     = aws_secretsmanager_secret.database_url.id
  secret_string = "postgresql://${var.master_username}:${random_password.master.result}@${aws_db_instance.this.address}:5432/${var.db_name}?schema=public"
}
