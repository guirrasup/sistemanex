# AWS Backup pro RDS — complementa (não substitui) os automated backups
# nativos do próprio RDS (backup_retention_days no módulo "database"). A
# diferença que importa: os snapshots do AWS Backup ficam num vault
# separado, sobrevivem a um "terraform destroy" acidental da instância (o
# vault não é deletado junto) e dão um ponto único de auditoria/retenção.

locals {
  name = "${var.project}-${var.environment}"
}

resource "aws_backup_vault" "this" {
  name = "${local.name}-backup-vault"
}

data "aws_iam_policy_document" "backup_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["backup.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "backup" {
  name               = "${local.name}-backup"
  assume_role_policy = data.aws_iam_policy_document.backup_assume.json
}

resource "aws_iam_role_policy_attachment" "backup_managed" {
  role       = aws_iam_role.backup.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForBackup"
}

resource "aws_backup_plan" "rds" {
  name = "${local.name}-rds-backup-plan"

  rule {
    rule_name         = "daily"
    target_vault_name = aws_backup_vault.this.name
    # A janela nativa do RDS (backup_window no módulo "database") é
    # "03:00-04:00" em UTC = 00:00-01:00 BRT. Este schedule roda às 06:00
    # UTC (03:00 BRT) — 2h depois do fim da janela nativa, pra não competir
    # por I/O com o snapshot automático do próprio RDS.
    schedule = "cron(0 6 * * ? *)"

    lifecycle {
      delete_after = var.retention_days
    }
  }
}

resource "aws_backup_selection" "rds" {
  name         = "${local.name}-rds-selection"
  plan_id      = aws_backup_plan.rds.id
  iam_role_arn = aws_iam_role.backup.arn

  resources = [
    var.rds_instance_arn,
  ]
}
