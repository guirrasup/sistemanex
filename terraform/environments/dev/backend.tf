# Preencha o bucket/tabela com os outputs do "terraform/bootstrap" depois de
# aplicá-lo uma vez. Até lá, comente este bloco inteiro e rode com estado
# local (só pra "terraform validate"/"plan" de teste) — não é seguro deixar
# em estado local pra um apply de verdade.

terraform {
  backend "s3" {
    bucket         = "sistemanex-terraform-state"
    key            = "dev/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "sistemanex-terraform-lock"
    encrypt        = true
  }
}
