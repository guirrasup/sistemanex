output "vpc_id" {
  value = aws_vpc.this.id
}

output "vpc_cidr" {
  value = aws_vpc.this.cidr_block
}

output "public_subnet_ids" {
  value = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  value = aws_subnet.private[*].id
}

output "flow_log_group_name" {
  description = "Nulo quando flow_logs_enabled=false."
  value       = var.flow_logs_enabled ? aws_cloudwatch_log_group.flow_logs[0].name : null
}
