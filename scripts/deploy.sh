#!/usr/bin/env bash
# ============================================================================
# NEX Enterprise ERP - Deploy (chamado pelo GitHub Actions via SSH)
#
# Atualiza o checkout local pra "origin/<branch>", reconstrói os containers e
# aplica as migrations pendentes. Diferente do antigo deploy-watch.sh, não faz
# polling: é disparado uma vez, no momento do push (ver .github/workflows/deploy.yml).
#
# Atenção: usa "git reset --hard", então qualquer alteração feita manualmente
# nos arquivos versionados direto no servidor é descartada.
#
# Uso: deploy.sh <diretório-do-repo> <branch>
# ============================================================================

set -euo pipefail

DIR="$1"
BRANCH="$2"
LOCK="/tmp/nex-deploy-$(basename "$DIR").lock"

# Mesmo lock usado pelo antigo deploy-watch.sh, pra nunca rodar dois deploys
# em paralelo no mesmo diretório (ex: um push manual coincidindo com outro).
exec 9>"$LOCK"
flock -n 9 || { echo "Já existe um deploy em andamento para $DIR, abortando."; exit 1; }

cd "$DIR"

git fetch origin "$BRANCH" --quiet
git reset --hard "origin/$BRANCH"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Atualizado para $(git rev-parse --short HEAD) — buildando $DIR"

docker compose build
docker compose up -d
docker compose exec -T backend npx prisma migrate deploy
docker image prune -f > /dev/null 2>&1 || true

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Deploy concluído em $DIR (agora em $(git rev-parse --short HEAD))"
