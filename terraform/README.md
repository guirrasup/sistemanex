# Terraform — sistemanex na AWS

Infraestrutura como código pro sistemanex: VPC, RDS Postgres, ECS Fargate + ALB
(backend), S3 + CloudFront (frontend SPA), Secrets Manager/SSM, WAF, AWS Backup,
alarmes CloudWatch + SNS, e a role OIDC que o GitHub Actions usa pra fazer deploy
sem chave de longa duração.

## Estrutura

```
terraform/
├── bootstrap/          # infra compartilhada de conta — roda 1x: state backend
│                       # (S3+DynamoDB), provider OIDC do GitHub, role de CI
│                       # somente-leitura (plan/drift)
├── environments/
│   ├── dev/            # barato: single-AZ, sem autoscaling/WAF/alarmes/logs
│   └── prod/           # robusto: Multi-AZ, autoscaling, WAF, alarmes, backup,
│                       # flow logs, access logs
└── modules/
    ├── networking/      # VPC, subnets públicas/privadas, NAT Gateway(s), flow logs
    ├── database/        # RDS Postgres
    ├── secrets/          # Secrets Manager (JWT, criptografia, ConectaGov) + SSM
    ├── compute/          # ECS Fargate + ALB + ECR + autoscaling + hardening + access logs
    ├── edge/              # S3 + CloudFront + ACM (frontend) + access logs
    ├── cicd/              # IAM role OIDC do GitHub Actions (deploy)
    ├── waf/                # WAFv2 pro CloudFront (só prod)
    ├── backup/             # AWS Backup pro RDS (só prod)
    └── observability/      # Alarmes CloudWatch + SNS (só prod)

.github/workflows/
├── deploy.yml              # build+push ECR, deploy ECS, sync S3+CloudFront (OIDC)
├── terraform-ci.yml        # fmt/tflint/tfsec + plan comentado em PRs que tocam terraform/
└── terraform-drift.yml     # plan agendado diário — detecta mudança feita fora do Terraform
```

## Ordem de aplicação

### 1. Bootstrap (uma única vez, pra sempre)

```bash
cd terraform/bootstrap
terraform init
terraform apply -var="project=sistemanex"
```

Isso cria o bucket S3 (`sistemanex-terraform-state`) e a tabela DynamoDB
(`sistemanex-terraform-lock`) usados por TODOS os ambientes abaixo. Não precisa
rodar de novo depois da primeira vez.

### 2. Credenciais do ConectaGov (antes de aplicar qualquer ambiente)

Crie `terraform/environments/<env>/secrets.auto.tfvars` (já coberto pelo
`.gitignore` da raiz — **nunca commitar este arquivo**) com os valores reais:

```hcl
conectagov_client_id     = "..."
conectagov_client_secret = "..."
conectagov_cpf_usuario   = "..."
conectagov_private_key   = "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

Se deixado de fora, o Terraform aplica normalmente mas os segredos do ConectaGov
simplesmente não são criados no Secrets Manager (os `count` nos recursos do
módulo `secrets` tratam esse caso) — o backend vai rodar sem integração real com
o ConectaGov até isso ser preenchido.

### 3. Ambiente (`dev` ou `prod`) — fluxo em 2 fases por causa do ACM

O certificado ACM é validado via DNS, e o DNS deste projeto vive no Cloudflare
(não Route53) — então a validação não é automática, precisa de uma ação manual
no meio do caminho.

```bash
cd terraform/environments/dev   # ou prod
terraform init
terraform apply   # wait_for_validation=false (default) — cria tudo MENOS a distribution CloudFront
```

Depois do apply:
1. Leia o output `acm_validation_records` (do módulo `edge`).
2. Crie o CNAME indicado no Cloudflare, **DNS only** (nuvem cinza) nesse registro
   específico, mesmo que o resto do domínio fique proxied.
3. Espere a validação propagar (minutos, normalmente).
4. Reaplique com `wait_for_validation=true`:
   ```bash
   terraform apply -var="wait_for_validation=true"
   ```
   Isso cria a distribution CloudFront de verdade.
5. Aponte o domínio final (`dev.nexnfe.com` em dev; prod ainda não decidido)
   no provedor de DNS do domínio pro output `cloudfront_domain_name`.

## Depois do apply — variáveis a colar no GitHub Actions

O workflow `.github/workflows/deploy.yml` usa **GitHub Environments** (`dev` e
`prod`, um por branch) pra achar os valores que não dá pra derivar por convenção
de nome (ECR/ECS/S3 são derivados automaticamente como `sistemanex-{dev|prod}*`
— só os 4 abaixo precisam ser colados manualmente, uma vez, depois do apply):

| Variável (GitHub Environment) | De onde vem |
|---|---|
| `AWS_DEPLOY_ROLE_ARN` | output `deploy_role_arn` do módulo `cicd` |
| `CLOUDFRONT_DISTRIBUTION_ID` | output `cloudfront_distribution_id` do módulo `edge` (só existe depois da fase 2 do ACM) |
| `PRIVATE_SUBNET_IDS` | output `private_subnet_ids` do módulo `networking` (formato: lista separada por vírgula, ex: `subnet-abc,subnet-def`) |
| `ECS_TASKS_SECURITY_GROUP_ID` | output `ecs_tasks_security_group_id` do módulo `compute` |

Crie os dois GitHub Environments (Settings → Environments → New environment:
`dev`, `prod`) e cole essas 4 variáveis em cada um (valores diferentes por
ambiente, claro).

Além disso, os workflows `terraform-ci.yml` (plan em PR) e `terraform-drift.yml`
(drift detection agendado) usam uma variável de **repositório** (não por
Environment, é compartilhada entre dev/prod/qualquer branch):

| Variável (Repository, não Environment) | De onde vem |
|---|---|
| `TF_PLAN_ROLE_ARN` | output `ci_plan_role_arn` do `terraform/bootstrap` |

Settings → Secrets and variables → Actions → Variables (aba "Repository
variables", não "Environment variables").

## Corte de produção (migração do deploy antigo)

Ver a sequência completa no histórico do planejamento — resumo:

1. Aplicar `dev` e `prod` (fases 1-5 acima) pros dois ambientes.
2. Colar as 4 variáveis acima nos dois GitHub Environments.
3. Fazer um push de teste em `develop` (dispara deploy em `dev`), verificar
   ponta a ponta (login, emissão de um documento fiscal, `/health`).
4. Repetir em `main` pra `prod`.
5. Só depois de um deploy limpo e verificado: desativar o runner self-hosted
   (`jrnex`), parar os stacks docker-compose em `/root/sistemanex` e
   `/root/sistemanex-dev`.

## Notas de segurança / operação

- **WAF (só prod)**: o `AWSManagedRulesCommonRuleSet` está com a regra
  `SizeRestrictions_BODY` desligada (uploads de XML de NF-e e certificado
  digital são grandes) — ainda assim, teste os fluxos de emissão e upload de
  certificado contra o Web ACL antes de confiar cegamente nas outras regras.
- **AWS Backup (só prod)**: retenção de 35 dias é pra recuperação operacional
  (erro humano, corrupção), não é o mecanismo de retenção fiscal de ~5 anos dos
  documentos em si — isso é sobre o conteúdo já durável no Postgres, resolvido
  por outro mecanismo (arquivamento de XMLs), não por esta retenção de backup.
- **AWS Budgets** (`terraform/bootstrap`, não `dev`/`prod`): o alerta de
  orçamento é de conta inteira (não filtrado por tag Project/Environment) —
  por isso mora no bootstrap, pra existir independente de qual ambiente está
  aplicado. Default `monthly_budget_usd = 100` pensado pro cenário de só
  `dev` no ar (~$75-80/mês estimado) — reajustar pra ~$400-450 quando `prod`
  também subir, e revisar de novo se a conta AWS passar a hospedar outros
  projetos além deste.
- **ALB não é mais a porta de entrada "oficial"**: todo tráfego deveria passar
  pelo CloudFront (que tem o WAF em prod); o ALB valida um header secreto pra
  recusar requests que batem nele diretamente. Isso é controlado por DOIS
  argumentos nos módulos `compute` e `edge` — `origin_verify_enabled` (bool,
  liga/desliga o hardening; precisa ser `true` literal, nunca derivado do
  valor do secret) e `origin_verify_secret_value` (o valor em si, tipicamente
  um `random_password` gerado no ambiente). `environments/prod/main.tf` já
  passa os dois; `dev` não passa nenhum (ALB continua aberto em dev, de
  propósito — mais barato pra testar).
- **Header de origem trafega em HTTP, não HTTPS**: o ALB de prod não tem
  `acm_certificate_arn` próprio (`alb_https_enabled=false` no módulo `edge`),
  então o CloudFront fala com o ALB em texto puro — o header secreto de
  origin-verify viaja nesse mesmo caminho. Isso é aceitável pro objetivo
  principal (barrar quem bate direto no DNS público do ALB, sem saber o
  secret), mas não é defesa contra alguém com visibilidade do tráfego
  CloudFront→ALB dentro da AWS. Se quiser TLS ponta a ponta, é preciso um
  certificado ACM regional pro ALB (em `us-east-1`, mesma região da infra
  agora — na prática dá pra reaproveitar o MESMO certificado que o
  CloudFront já usa, já que os dois caem na mesma região) — fora do escopo
  desta sessão, considerar como melhoria futura.
- **CloudFront `custom_error_response` é global, não por path**: a
  configuração de fallback SPA (qualquer 403/404 vira `200 /index.html`) se
  aplica também às respostas de `/api/*` vindas do ALB — um 403 de JWT
  inválido, por exemplo, chega no browser como `200` com o HTML do SPA em vez
  do corpo de erro real. Isso é um comportamento pré-existente do módulo
  `edge` (não introduzido nesta sessão), mas agora também mascara o 403 do
  origin-verify acima, dificultando diagnóstico caso o header saia
  dessincronizado entre `compute` e `edge`. Corrigir direito exige Lambda@Edge
  ou uma CloudFront Function nessa origem — fora do escopo desta sessão,
  considerar como melhoria futura se o frontend depender de status codes
  reais de erro da API.

## Tagging

Todo recurso criado pelo provider AWS em qualquer ambiente (`bootstrap`, `dev`,
`prod`) recebe automaticamente `Project`, `Environment` e `ManagedBy=terraform`
via `default_tags` no bloco `provider "aws"` — não precisa (e não deve) taggear
recurso por recurso manualmente; só adicione uma tag extra num resource
específico se ele precisar de algo além desse conjunto padrão (nesse caso as
tags se mesclam, a específica não substitui as automáticas).

## Observabilidade de rede e auditoria de acesso (só prod)

Três mecanismos de log, todos opt-in via variável (`false` em dev, `true` em
prod — ver `environments/prod/main.tf`), nenhum depende de nada account-wide:

- **VPC Flow Logs** (`modules/networking`, var `flow_logs_enabled`) — tráfego
  de rede (aceito + rejeitado) pro CloudWatch Logs, grupo
  `/vpc/sistemanex-prod/flow-logs`.
- **Access logs do ALB** (`modules/compute`, var `access_logs_enabled`) —
  bucket S3 dedicado `sistemanex-prod-alb-logs`.
- **Access logs do CloudFront** (`modules/edge`, var `access_logs_enabled`) —
  bucket S3 dedicado `sistemanex-prod-cloudfront-logs` (usa ACL clássica, não
  bucket policy — é assim que o CloudFront exige pra esse mecanismo de log).

## Pipeline de CI do Terraform

Dois workflows novos, nenhum aplica nada (só leitura/plan):

- **`.github/workflows/terraform-ci.yml`** — roda em todo PR que toque
  `terraform/**`: `terraform fmt -check`, `tflint` em cada módulo/ambiente,
  `tfsec` (modo `soft_fail`, não bloqueia o PR ainda — ajuste depois de
  avaliar o primeiro lote de achados), e `terraform plan` pra `dev` e `prod`
  (comentado automaticamente no PR).
- **`.github/workflows/terraform-drift.yml`** — roda todo dia (12:00 UTC /
  09:00 BRT) rodando `terraform plan -detailed-exitcode`; se detectar
  qualquer diferença entre o estado e a infra real (alguém mexeu no console
  manualmente, por exemplo), o job falha de propósito — GitHub notifica por
  email quem observa o repositório.

**Nenhum dos dois funciona até você aplicar o `bootstrap` de verdade** (ele é
quem cria a role `ci_plan_role_arn` que os dois usam) **e colar
`TF_PLAN_ROLE_ARN`** como variável de repositório no GitHub (ver tabela acima).

## Conta AWS

Projeto migrado pra rodar na conta dedicada **suptecnology** (`133208009089`),
região **us-east-1**. Diferente da conta usada originalmente durante o
desenvolvimento deste projeto, esta é uma conta standalone — **não** é membro
de nenhuma AWS Organization (confirmado via `aws organizations
describe-organization` → `AWSOrganizationsNotInUseException`), e não tinha
nenhum CloudTrail/GuardDuty/Config/OIDC provider pré-existente na hora da
migração. Ou seja, nenhum dos riscos de duplicação/colisão com infraestrutura
central que bloqueavam a seção abaixo numa conta anterior se aplicam aqui.

Localmente, use o profile nomeado `suptecnology` do AWS CLI (`~/.aws/config` /
`~/.aws/credentials`) pra rodar qualquer comando `terraform`/`aws` deste
projeto — ex: `AWS_PROFILE=suptecnology terraform plan`. O CI/CD (GitHub
Actions) não usa esse profile — usa as roles OIDC dos módulos `cicd`/
`bootstrap`, que não dependem de nenhuma credencial estática.

## Pendente — CloudTrail / AWS Config / GuardDuty

Ainda não implementado nesta sessão — não há mais o bloqueio de organização
que existia antes (conta standalone, ver seção acima), então fica livre pra
implementar quando for prioridade. Ficaria num novo "ambiente"
`terraform/environments/account-baseline/` (region `us-east-1`), separado de
`dev`/`prod` porque CloudTrail/Config/GuardDuty são recursos de conta inteira,
não por aplicação — mesma lógica já aplicada ao provider OIDC do GitHub e à
role de CI, que moram em `bootstrap/`.
