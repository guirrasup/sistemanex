# Mesmo bucket/tabela do "terraform/bootstrap" que o ambiente "dev" usa —
# só a key muda, pra cada ambiente ter seu próprio arquivo de estado dentro
# do mesmo bucket.
#
# Comente este bloco inteiro pra rodar "terraform validate"/"plan" de teste
# com estado local — não é seguro deixar assim pra um apply de verdade.

terraform {
  backend "s3" {
    bucket         = "sistemanex-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "sistemanex-terraform-lock"
    encrypt        = true
  }
}
