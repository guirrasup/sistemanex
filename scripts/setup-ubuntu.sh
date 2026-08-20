#!/usr/bin/env bash
# ============================================================================
# NEX Enterprise ERP - Script de provisionamento de servidor Ubuntu do zero
#
# O que este script faz:
#   1. Atualiza o sistema
#   2. Instala dependências básicas (git, curl, ufw)
#   3. Instala o Docker Engine + plugin do Docker Compose
#   4. Configura o firewall (UFW) liberando só SSH, HTTP e HTTPS
#   5. Cria o usuário do grupo docker (se não estiver rodando como root)
#
# O que este script NÃO faz (passos manuais, ver instruções no final):
#   - Clonar o repositório (precisa da sua chave SSH cadastrada no GitHub)
#   - Preencher o arquivo .env com senhas/segredos reais
#   - Subir os containers (docker compose up)
#
# Uso:
#   chmod +x scripts/setup-ubuntu.sh
#   ./scripts/setup-ubuntu.sh
# ============================================================================

set -euo pipefail

# Roda "sudo" automaticamente só se não formos root (em VPS geralmente já se loga como root)
if [ "$(id -u)" -eq 0 ]; then
  SUDO=""
else
  SUDO="sudo"
fi

echo "==> [1/5] Atualizando pacotes do sistema"
$SUDO apt update
$SUDO apt upgrade -y

echo "==> [2/5] Instalando dependências básicas"
$SUDO apt install -y ca-certificates curl gnupg git ufw

echo "==> [3/5] Instalando Docker Engine + Compose plugin"
if command -v docker &> /dev/null; then
  echo "Docker já está instalado (versão: $(docker --version)), pulando instalação."
else
  curl -fsSL https://get.docker.com | $SUDO sh
fi

echo "==> [4/5] Configurando firewall (UFW)"
$SUDO ufw allow OpenSSH
$SUDO ufw allow 80/tcp
$SUDO ufw allow 443/tcp
$SUDO ufw --force enable
$SUDO ufw status verbose

echo "==> [5/5] Ajustando permissões do Docker"
if [ "$(id -u)" -ne 0 ]; then
  $SUDO usermod -aG docker "$USER"
  echo "Usuário '$USER' adicionado ao grupo docker. Saia e conecte via SSH novamente para valer."
else
  echo "Rodando como root, nenhum ajuste de grupo necessário."
fi

cat <<'EOF'

============================================================================
 Servidor provisionado! Próximos passos manuais:
============================================================================

1) Gere uma chave SSH (se ainda não tiver) e cadastre no GitHub:
     ssh-keygen -t ed25519 -C "seu_email@exemplo.com"
     cat ~/.ssh/id_ed25519.pub
   -> Cole em GitHub > Settings > SSH and GPG keys (ou como Deploy Key do repo)

2) Clone o repositório:
     git clone git@github.com:guirrasup/sistemanex.git
     cd sistemanex

3) Crie o arquivo de variáveis de ambiente a partir do exemplo:
     cp .env.example .env
     nano .env
   Preencha POSTGRES_PASSWORD, JWT_SECRET (gere com "openssl rand -base64 32")
   e GEMINI_API_KEY (se for usar OCR com IA). Não deixe os valores de exemplo.

4) Suba a aplicação:
     docker compose up -d --build
     docker compose logs -f app

5) Rode as migrations do banco:
     docker compose exec app npx prisma migrate deploy

6) Acesse http://SEU_IP_OU_DOMINIO no navegador para confirmar que subiu.

7) (Recomendado) Configure HTTPS com Certbot apontando um domínio para este
   servidor antes de usar em produção de verdade.
============================================================================
EOF
