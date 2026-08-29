#!/usr/bin/env bash
# ============================================================================
# NEX Enterprise ERP - Auto-deploy por polling
#
# Pensado para rodar via cron a cada minuto. Verifica se a branch monitorada
# avançou no GitHub e, se sim, atualiza o checkout local e reconstrói os
# containers. Se não houver commit novo, não faz nada (custo de um "git fetch").
#
# Atenção: usa "git reset --hard", então qualquer alteração feita manualmente
# nos arquivos versionados direto no servidor é descartada no próximo deploy.
#
# Uso: deploy-watch.sh <diretório-do-repo> <branch>
# ============================================================================

set -euo pipefail

DIR="$1"
BRANCH="$2"
LOCK="/tmp/nex-deploy-$(basename "$DIR").lock"

exec 9>"$LOCK"
flock -n 9 || exit 0

cd "$DIR"

git fetch origin "$BRANCH" --quiet

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse "origin/$BRANCH")

if [ "$LOCAL" = "$REMOTE" ]; then
  exit 0
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Nova versão em $BRANCH ($LOCAL -> $REMOTE) — atualizando $DIR"

git reset --hard "origin/$BRANCH"
docker compose build
docker compose up -d
docker compose exec -T backend npx prisma migrate deploy
docker image prune -f > /dev/null 2>&1 || true

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Deploy concluído em $DIR (agora em $REMOTE)"
