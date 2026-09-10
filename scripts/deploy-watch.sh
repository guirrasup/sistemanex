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
# O sha do último deploy CONCLUÍDO fica em ".deployed-sha" dentro do repo —
# não usamos "git rev-parse HEAD" pra essa checagem porque o reset --hard já
# avança o HEAD antes do build rodar; se o build falhar, HEAD == origin e o
# próximo cron acharia (erroneamente) que não há nada pendente, deixando o
# ambiente parado na versão quebrada indefinidamente.
#
# Uso: deploy-watch.sh <diretório-do-repo> <branch>
# ============================================================================

set -euo pipefail

# O "git reset --hard" lá embaixo reescreve os arquivos do repo, inclusive este
# próprio script — o que corrompe a execução em andamento (linhas puladas ou
# lidas erradas). Por isso, na primeira chamada, copia a si mesmo pra fora do
# repo e reexecuta a partir de lá antes de tocar em git. A cópia é removida ao
# final (trap), pra não vazar arquivos em /tmp a cada execução do cron.
if [ "${DEPLOY_WATCH_RELOCATED:-}" != "1" ]; then
  TMP_SELF="$(mktemp /tmp/deploy-watch-XXXXXX.sh)"
  cp "$0" "$TMP_SELF"
  chmod +x "$TMP_SELF"
  export DEPLOY_WATCH_RELOCATED=1
  exec "$TMP_SELF" "$@"
fi
trap 'rm -f "$0"' EXIT

DIR="$1"
BRANCH="$2"
LOCK="/tmp/nex-deploy-$(basename "$DIR").lock"
MARKER="$DIR/.deployed-sha"

exec 9>"$LOCK"
flock -n 9 || exit 0

cd "$DIR"

# Falha de rede ao falar com o GitHub é comum e transitória (SSH intermitente
# no host) — não vale logar um stack trace por minuto, só tenta de novo no
# próximo cron. O timeout evita que um fetch travado (hang, não timeout do
# próprio SSH) segure o flock indefinidamente e impeça todas as execuções
# seguintes do cron pra esse diretório.
timeout 30 git fetch origin "$BRANCH" --quiet || exit 0

REMOTE=$(git rev-parse "origin/$BRANCH")
DEPLOYED=$(cat "$MARKER" 2>/dev/null || echo "")

if [ "$DEPLOYED" = "$REMOTE" ]; then
  exit 0
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Nova versão em $BRANCH ($DEPLOYED -> $REMOTE) — atualizando $DIR"

git reset --hard "origin/$BRANCH"
docker compose build
docker compose up -d
docker compose exec -T backend npx prisma migrate deploy
docker image prune -f > /dev/null 2>&1 || true

echo "$REMOTE" > "$MARKER"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Deploy concluído em $DIR (agora em $REMOTE)"
