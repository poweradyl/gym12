#!/usr/bin/env bash
# GYM 12 — atualização mensal a partir do openGym (upstream).
#
# Traz a release mais nova do openGym para um branch sync/<tag>, roda os testes e o build,
# escreve um resumo em português em docs/gym12/sync/RESUMO-<tag>.md e, se tudo passar,
# publica uma PRÉVIA no Cloudflare Pages. Nunca mexe no branch gym12 nem publica em produção.
#
# Compatível com o bash 3.2 do macOS. Rode `scripts/sync-upstream.sh --help`.
set -euo pipefail

# ---------------------------------------------------------------------------------------------
# Configuração
# ---------------------------------------------------------------------------------------------
UPSTREAM_REMOTE="upstream"
UPSTREAM_REPO="DuarteSantos8/openGym"
ORIGIN_REMOTE="origin"
BASE_BRANCH="gym12"
CF_PROJECT="gym12"
# wrangler fixo na 3.x: a 4.x manda "pages project" para Workers (visto em 06/11/2026).
WRANGLER_VER="3.114.17"
CF_ACCOUNT_ID="303fc1d767b05625df9021548808fc65"
# Token do Cloudflare: lido de ~/.gym12-cloudflare-token se existir (nunca impresso).
if [ -z "${CLOUDFLARE_API_TOKEN:-}" ] && [ -f "$HOME/.gym12-cloudflare-token" ]; then
  CLOUDFLARE_API_TOKEN=$(tr -d '[:space:]' < "$HOME/.gym12-cloudflare-token"); export CLOUDFLARE_API_TOKEN
fi
export CLOUDFLARE_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-$CF_ACCOUNT_ID}"
SUMMARY_DIR="docs/gym12/sync"
BUILD_SCRIPT="scripts/gym12-build.sh"

# Falhas de teste que já existem no openGym (não são nossas). Formato: "<arquivo> > <nome completo>".
KNOWN_FAILURES="scripts/app-icons.test.mjs > generated icon files match a fresh draw (the small ones; --check compares them all)
scripts/app-icons.test.mjs > node scripts/app-icons.mjs --check finds nothing out of date"

# Branches em que a prévia NUNCA pode ser publicada (produção).
FORBIDDEN_DEPLOY_BRANCHES="gym12 main master production prod"

# Limites para o resumo não virar um livro.
MAX_SUBJECTS_PER_GROUP=25

# ---------------------------------------------------------------------------------------------
# Utilidades
# ---------------------------------------------------------------------------------------------
say()  { printf '==> %s\n' "$*"; }
warn() { printf 'AVISO: %s\n' "$*" >&2; }
die()  { printf 'ERRO: %s\n' "$*" >&2; exit 1; }

usage() {
  cat <<'EOF'
Uso: scripts/sync-upstream.sh [opções]

Atualiza o GYM 12 com a release mais nova do openGym, sem tocar no branch gym12.

O que o script faz:
  1. Recusa rodar com alterações não commitadas e guarda o branch atual.
  2. Busca as tags do openGym (remoto "upstream") e acha a release publicada mais nova
     (tags vX.Y.Z, sem -rc/-beta; confere com o GitHub pelo gh, quando disponível).
     Se o gym12 já estiver nela, diz "Nada novo" e sai.
  3. Cria o branch sync/<tag> a partir do gym12 e faz o merge da tag (--no-ff).
     Em conflito: lista e classifica os arquivos, escreve o resumo e deixa o branch
     no estado de conflito para uma pessoa resolver (saída 2).
  4. Roda npm ci, os testes (falhas novas, fora da lista conhecida, reprovam) e o build
     (scripts/gym12-build.sh).
  5. Escreve docs/gym12/sync/RESUMO-<tag>.md (novidades, conflitos, testes, build,
     próximos passos) e faz commit dele no branch sync/<tag>.
  6. Se testes e build passarem, envia sync/<tag> ao origin e publica uma PRÉVIA no
     Cloudflare Pages (branch sync-<tag com hífens>). Nunca publica em produção.
  7. Volta ao branch original.

Opções:
  --preview             Publica a prévia se tudo passar (padrão).
  --no-preview          Não envia nada ao origin nem publica a prévia.
  --abort-on-conflict   Em conflito, desfaz o merge (git merge --abort), apaga o
                        branch sync/<tag> e volta ao branch original (saída 2).
  --dry-run             Só mostra o que seria feito: não faz merge, push nem deploy.
  -h, --help            Mostra esta ajuda.

Saídas: 0 = tudo certo (ou nada novo); 1 = erro, testes ou build falharam;
        2 = conflito no merge.

Para aprovar uma prévia (depois de conferir):
  git checkout gym12 && git merge --ff-only sync/<tag> && git push origin gym12
A produção é publicada a partir do branch gym12, fora deste script.

Variáveis de ambiente:
  SYNC_SKIP_GH=1        Não consulta o GitHub (gh); usa só as tags.
EOF
}

# Ordena versões vX.Y.Z (só as estáveis) da menor para a maior.
semver_sort() {
  grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | sed 's/^v//' | sort -t. -k1,1n -k2,2n -k3,3n | sed 's/^/v/' || true
}

# Verdadeiro se a versão $1 >= $2.
version_ge() {
  [ "$1" = "$2" ] && return 0
  local highest
  highest=$(printf '%s\n%s\n' "$1" "$2" | semver_sort | tail -n 1)
  [ "$highest" = "$1" ]
}

# Chaves de tradução de um arquivo de locale (uma por linha, ordenadas, sem repetição).
locale_keys() {
  perl -ne 'if (/^\s*(["\x27])((?:\\.|(?!\1).)*)\1\s*:/) { print "$2\n" }' | LC_ALL=C sort -u
}

# Lista de arquivos originais alterados pelo GYM 12 (tabela do GYM12_CHANGES.md).
original_files_from_changes() {
  awk '
    /^## / { insec = ($0 ~ /^## Arquivos originais alterados/) ; next }
    insec && /^\|/ {
      n = split($0, c, "|")
      if (n < 4) next
      f = c[3]
      gsub(/`/, "", f); gsub(/^[ \t]+|[ \t]+$/, "", f)
      if (f == "" || f == "Arquivo" || f ~ /^-+$/) next
      m = split(f, parts, /[ \t]*,[ \t]*/)
      for (i = 1; i <= m; i++) if (parts[i] != "") print parts[i]
    }
  '
}

# Classifica um caminho: camada | original | outro.
classify_path() {
  local p="$1"
  case "$p" in
    frontend/src/gym12/*|frontend/vite.gym12.config.js|brand/*|scripts/gym12-*|scripts/sync-upstream.sh|docs/gym12/*|GYM12_CHANGES.md)
      echo "camada"; return ;;
  esac
  if [ -n "$ORIGINAL_FILES" ] && printf '%s\n' "$ORIGINAL_FILES" | grep -Fxq -- "$p"; then
    echo "original"; return
  fi
  echo "outro"
}

guard_deploy_branch() {
  local b="$1" f
  [ -n "$b" ] || die "nome de branch da prévia vazio; deploy recusado."
  for f in $FORBIDDEN_DEPLOY_BRANCHES; do
    [ "$b" = "$f" ] && die "deploy recusado: --branch $b é produção. Este script só publica prévias."
  done
  case "$b" in
    sync-*) ;;
    *) die "deploy recusado: o branch da prévia precisa começar com sync- (recebido: $b)." ;;
  esac
}

guard_push_branch() {
  local b="$1" f
  [ "$b" = "$BASE_BRANCH" ] && die "push recusado: este script nunca envia o branch $BASE_BRANCH."
  for f in $FORBIDDEN_DEPLOY_BRANCHES; do
    [ "$b" = "$f" ] && die "push recusado: o branch $b é protegido."
  done
  case "$b" in
    sync/*) ;;
    *) die "push recusado: só branches sync/<tag> podem ser enviados (recebido: $b)." ;;
  esac
}

current_branch() { git symbolic-ref --short -q HEAD || git rev-parse --short HEAD; }

# ---------------------------------------------------------------------------------------------
# Argumentos
# ---------------------------------------------------------------------------------------------
PREVIEW=1
DRY_RUN=0
ABORT_ON_CONFLICT=0
while [ $# -gt 0 ]; do
  case "$1" in
    --preview) PREVIEW=1 ;;
    --no-preview) PREVIEW=0 ;;
    --abort-on-conflict) ABORT_ON_CONFLICT=1 ;;
    --dry-run) DRY_RUN=1 ;;
    -h|--help) usage; exit 0 ;;
    *) printf 'Opção desconhecida: %s\n\n' "$1" >&2; usage >&2; exit 1 ;;
  esac
  shift
done

# ---------------------------------------------------------------------------------------------
# 1. Pré-condições
# ---------------------------------------------------------------------------------------------
ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || die "rode dentro do repositório do GYM 12."
cd "$ROOT"

git rev-parse --verify -q "refs/heads/$BASE_BRANCH" >/dev/null \
  || die "o branch $BASE_BRANCH não existe neste repositório."
git remote get-url "$UPSTREAM_REMOTE" >/dev/null 2>&1 \
  || die "o remoto \"$UPSTREAM_REMOTE\" não existe. Crie com: git remote add upstream https://github.com/$UPSTREAM_REPO.git"

DIRTY=$(git status --porcelain)
if [ -n "$DIRTY" ]; then
  if [ "$DRY_RUN" = 1 ]; then
    warn "há alterações não commitadas; numa execução real o script recusaria rodar:"
    printf '%s\n' "$DIRTY" | sed 's/^/    /' >&2
  else
    printf '%s\n' "$DIRTY" | sed 's/^/    /' >&2
    die "há alterações não commitadas (acima). Faça commit ou guarde-as (git stash -u) e rode de novo."
  fi
fi

ORIG_BRANCH=$(current_branch)
say "Branch atual: $ORIG_BRANCH"

# ---------------------------------------------------------------------------------------------
# 2. Qual é a release nova?
# ---------------------------------------------------------------------------------------------
say "Buscando tags do openGym ($UPSTREAM_REMOTE)…"
git fetch -q "$UPSTREAM_REMOTE" --tags || die "não consegui buscar as tags do $UPSTREAM_REMOTE."

UPSTREAM_TAGS=$(git ls-remote --tags --refs "$UPSTREAM_REMOTE" | awk '{print $2}' | sed 's#^refs/tags/##' | semver_sort)
[ -n "$UPSTREAM_TAGS" ] || die "nenhuma tag vX.Y.Z encontrada no $UPSTREAM_REMOTE."
LATEST=$(printf '%s\n' "$UPSTREAM_TAGS" | tail -n 1)

if [ "${SYNC_SKIP_GH:-0}" != 1 ] && command -v gh >/dev/null 2>&1; then
  GH_TAG=$(gh release list -R "$UPSTREAM_REPO" --exclude-drafts --exclude-pre-releases --limit 1 \
             --json tagName --jq '.[0].tagName' 2>/dev/null || true)
  if [ -n "$GH_TAG" ] && printf '%s\n' "$UPSTREAM_TAGS" | grep -Fxq -- "$GH_TAG"; then
    if [ "$GH_TAG" != "$LATEST" ]; then
      warn "a tag mais alta ($LATEST) não é a release publicada mais nova no GitHub; usando a release $GH_TAG."
      LATEST="$GH_TAG"
    else
      say "GitHub confirma: a release publicada mais nova é $GH_TAG."
    fi
  else
    warn "não consegui conferir com o GitHub (gh); sigo pela tag mais alta: $LATEST."
  fi
fi

git rev-parse --verify -q "refs/tags/$LATEST^{commit}" >/dev/null || die "a tag $LATEST não está no repositório local."

CURRENT=$(git tag --merged "$BASE_BRANCH" | semver_sort | tail -n 1)
[ -n "$CURRENT" ] || die "não achei nenhuma tag vX.Y.Z dentro do $BASE_BRANCH."

if version_ge "$CURRENT" "$LATEST" || git merge-base --is-ancestor "$LATEST" "$BASE_BRANCH"; then
  echo "Nada novo: o GYM 12 já está na $CURRENT."
  exit 0
fi

SYNC_BRANCH="sync/$LATEST"
DEPLOY_BRANCH="sync-$(printf '%s' "$LATEST" | tr '.' '-')"
SUMMARY_REL="$SUMMARY_DIR/RESUMO-$LATEST.md"
SUMMARY="$ROOT/$SUMMARY_REL"
LOG_DIR="$(git rev-parse --absolute-git-dir)/gym12-sync/$LATEST"
guard_deploy_branch "$DEPLOY_BRANCH"
guard_push_branch "$SYNC_BRANCH"

say "Release nova: $CURRENT → $LATEST"

if [ "$DRY_RUN" = 1 ]; then
  n_commits=$(git rev-list --count --no-merges "$CURRENT..$LATEST")
  n_files=$(git diff --name-only "$CURRENT" "$LATEST" | wc -l | tr -d ' ')
  cat <<EOF
[simulação] Nada será alterado. Numa execução real o script faria:
  - git checkout -b $SYNC_BRANCH $BASE_BRANCH
  - git merge --no-ff --no-edit -m "sync: openGym $LATEST" $LATEST   ($n_commits commits, $n_files arquivos)
  - cd frontend && npm ci && npm test   (falhas conhecidas toleradas: app-icons)
  - bash $BUILD_SCRIPT
  - escrever $SUMMARY_REL e fazer commit dele em $SYNC_BRANCH
EOF
  if [ "$PREVIEW" = 1 ]; then
    cat <<EOF
  - se testes e build passarem: git push -u $ORIGIN_REMOTE $SYNC_BRANCH
  - npx --yes wrangler@$WRANGLER_VER pages deploy frontend/dist --project-name $CF_PROJECT --branch $DEPLOY_BRANCH   (prévia)
EOF
  else
    echo "  - sem prévia (--no-preview): nada de push nem deploy"
  fi
  echo "  - voltar para $ORIG_BRANCH"
  exit 0
fi

if git rev-parse --verify -q "refs/heads/$SYNC_BRANCH" >/dev/null; then
  die "o branch $SYNC_BRANCH já existe. Confira-o ou apague (git branch -D $SYNC_BRANCH) e rode de novo."
fi

mkdir -p "$LOG_DIR"
ORIGINAL_FILES=$( (git show "$BASE_BRANCH:GYM12_CHANGES.md" 2>/dev/null || cat GYM12_CHANGES.md 2>/dev/null || true) \
                  | original_files_from_changes | sort -u)

# ---------------------------------------------------------------------------------------------
# Coleta do que chegou de novo (só lê as tags; vale com ou sem conflito)
# ---------------------------------------------------------------------------------------------
CURRENT_DATE=$(git log -1 --format=%cs "$CURRENT")
LATEST_DATE=$(git log -1 --format=%cs "$LATEST")
CURRENT_SHA=$(git rev-parse --short "$CURRENT^{commit}")
LATEST_SHA=$(git rev-parse --short "$LATEST^{commit}")

# CHANGELOG: seções das versões novas (do topo da tag nova até o cabeçalho da antiga).
CHANGELOG_NEW=$(git show "$LATEST:CHANGELOG.md" 2>/dev/null | awk -v old="$CURRENT" '
  /^## v[0-9]/ { if ($2 == old) exit; p = 1 }
  p' || true)

N_COMMITS=$(git rev-list --count --no-merges "$CURRENT..$LATEST")
N_MERGES=$(git rev-list --count --merges "$CURRENT..$LATEST")
git log --no-merges --format='%s' "$CURRENT..$LATEST" > "$LOG_DIR/commits.txt"
# "prefixo<TAB>assunto"; sem prefixo vira "outros".
awk '{
  pre = "outros"
  if (match($0, /^[A-Za-z][A-Za-z0-9_.\/-]*:/)) pre = tolower(substr($0, 1, RLENGTH - 1))
  print pre "\t" $0
}' "$LOG_DIR/commits.txt" > "$LOG_DIR/commits-prefixed.txt"

CHANGED_FILES=$(git diff --name-only "$CURRENT" "$LATEST")
N_CHANGED=$(printf '%s\n' "$CHANGED_FILES" | grep -c . || true)
if [ -n "$ORIGINAL_FILES" ]; then
  TOUCHED_BOTH=$(printf '%s\n' "$CHANGED_FILES" | grep -Fx -f <(printf '%s\n' "$ORIGINAL_FILES") || true)
else
  TOUCHED_BOTH=""
fi
CHANGED_LAYER=$(printf '%s\n' "$CHANGED_FILES" | while IFS= read -r f; do
  [ -n "$f" ] && [ "$(classify_path "$f")" = camada ] && printf '%s\n' "$f"; done || true)

PT_FILE="frontend/src/locales/pt.js"
PTBR_FILE="frontend/src/locales/pt-BR.js"
git show "$CURRENT:$PT_FILE"   2>/dev/null | locale_keys > "$LOG_DIR/pt-old.txt"   || true
git show "$LATEST:$PT_FILE"    2>/dev/null | locale_keys > "$LOG_DIR/pt-new.txt"   || true
git show "$CURRENT:$PTBR_FILE" 2>/dev/null | locale_keys > "$LOG_DIR/ptbr-old.txt" || true
git show "$LATEST:$PTBR_FILE"  2>/dev/null | locale_keys > "$LOG_DIR/ptbr-new.txt" || true
LC_ALL=C comm -13 "$LOG_DIR/pt-old.txt" "$LOG_DIR/pt-new.txt" > "$LOG_DIR/pt-added.txt"
LC_ALL=C comm -13 "$LOG_DIR/ptbr-old.txt" "$LOG_DIR/ptbr-new.txt" > "$LOG_DIR/ptbr-added.txt"
LC_ALL=C comm -23 "$LOG_DIR/pt-added.txt" "$LOG_DIR/ptbr-new.txt" > "$LOG_DIR/pt-added-sem-br.txt"
N_PT_ADDED=$(grep -c . "$LOG_DIR/pt-added.txt" || true)
N_PTBR_ADDED=$(grep -c . "$LOG_DIR/ptbr-added.txt" || true)
N_PT_SEM_BR=$(grep -c . "$LOG_DIR/pt-added-sem-br.txt" || true)

count_exercises() { git ls-tree -r --name-only "$1" -- catalogue/exercises 2>/dev/null | grep -c '\.json$' || true; }
EX_OLD=$(count_exercises "$CURRENT")
EX_NEW=$(count_exercises "$LATEST")
EX_ADDED=$(git diff --name-only --diff-filter=A "$CURRENT" "$LATEST" -- catalogue/exercises | grep -c '\.json$' || true)
EX_REMOVED=$(git diff --name-only --diff-filter=D "$CURRENT" "$LATEST" -- catalogue/exercises | grep -c '\.json$' || true)

# ---------------------------------------------------------------------------------------------
# Estado dos passos (preenchido abaixo, usado no resumo)
# ---------------------------------------------------------------------------------------------
MERGE_STATE="não feito"
CONFLICTS=""
NPM_CI_STATE="não rodou"
TEST_STATE="não rodou"
TEST_TOTALS=""
TEST_FAILED_LIST=""
TEST_NEW_FAILURES=""
BUILD_STATE="não rodou"
PREVIEW_STATE="não publicada"
PREVIEW_URL=""
PREVIEW_NOTE=""

write_summary() {
  mkdir -p "$(dirname "$SUMMARY")"
  {
    echo "# Resumo da sincronização: openGym $CURRENT → $LATEST"
    echo
    echo "- Gerado em: $(date '+%Y-%m-%d %H:%M')"
    echo "- De: \`$CURRENT\` ($CURRENT_DATE, commit \`$CURRENT_SHA\`)"
    echo "- Para: \`$LATEST\` ($LATEST_DATE, commit \`$LATEST_SHA\`)"
    echo "- Branch: \`$SYNC_BRANCH\`"
    echo "- Merge: $MERGE_STATE"
    echo "- Registros detalhados (fora do git): \`.git/gym12-sync/$LATEST/\`"
    echo
    echo "## O que chegou de novo"
    echo
    echo "### Destaques do CHANGELOG"
    echo
    if [ -n "$CHANGELOG_NEW" ]; then
      echo "Títulos dos destaques de cada versão nova, citados em inglês como estão no CHANGELOG do openGym:"
      echo
      printf '%s\n' "$CHANGELOG_NEW" | awk '
        /^## v[0-9]/ { printf "\n**%s**\n\n", substr($0, 4); next }
        /^\*\*[^*]+\*\*/ { t = $0; sub(/^\*\*/, "", t); sub(/\*\*.*/, "", t); print "- “" t "”" }
      '
      echo
      echo "<details><summary>Texto completo do CHANGELOG das versões novas (em inglês)</summary>"
      echo
      printf '%s\n' "$CHANGELOG_NEW" | sed 's/^## /### /'
      echo
      echo "</details>"
    else
      echo "Não encontrei seções novas no CHANGELOG.md da $LATEST."
    fi
    echo
    echo "### Commits"
    echo
    echo "$N_COMMITS commits entre \`$CURRENT\` e \`$LATEST\` (mais $N_MERGES merges, não listados), agrupados pelo prefixo do assunto (assuntos em inglês, como no openGym):"
    echo
    cut -f1 "$LOG_DIR/commits-prefixed.txt" | sort | uniq -c | sort -rn | while read -r cnt pre; do
      echo "#### $pre ($cnt)"
      echo
      awk -F'\t' -v p="$pre" -v max="$MAX_SUBJECTS_PER_GROUP" '
        $1 == p { n++; if (n <= max) { s = $2; gsub(/`/, "\x27", s); print "- `" s "`" } }
        END { if (n > max) printf "- … e mais %d\n", n - max }
      ' "$LOG_DIR/commits-prefixed.txt"
      echo
    done
    echo "### Arquivos que o GYM 12 também alterou — conferir"
    echo
    echo "O openGym mudou $N_CHANGED arquivos. Cruzando com a lista de arquivos originais do \`GYM12_CHANGES.md\`:"
    echo
    if [ -n "$TOUCHED_BOTH" ]; then
      printf '%s\n' "$TOUCHED_BOTH" | sed 's/^\(.*\)$/- `\1` — **conferir**/'
    else
      echo "- Nenhum arquivo original alterado pelo GYM 12 mudou nesta versão."
    fi
    if [ -n "$CHANGED_LAYER" ]; then
      echo
      echo "Atenção: o openGym mexeu em caminhos da camada do GYM 12 (inesperado, conferir):"
      echo
      printf '%s\n' "$CHANGED_LAYER" | sed 's/^\(.*\)$/- `\1`/'
    fi
    echo
    echo "### Traduções novas (pt e pt-BR)"
    echo
    echo "- Chaves novas em \`$PT_FILE\`: $N_PT_ADDED"
    echo "- Chaves novas em \`$PTBR_FILE\`: $N_PTBR_ADDED"
    echo "- Chaves novas em pt sem tradução própria em pt-BR (herdam o pt-PT; candidatas para a sobreposição pt-BR do GYM 12): $N_PT_SEM_BR"
    local f label
    for f in pt-added-sem-br ptbr-added pt-added; do
      case "$f" in
        pt-added-sem-br) label="Chaves novas em pt sem tradução em pt-BR" ;;
        ptbr-added) label="Chaves novas em pt-BR" ;;
        pt-added) label="Todas as chaves novas em pt" ;;
      esac
      if [ -s "$LOG_DIR/$f.txt" ]; then
        echo
        echo "<details><summary>$label ($(grep -c . "$LOG_DIR/$f.txt"))</summary>"
        echo
        echo '```text'
        cat "$LOG_DIR/$f.txt"
        echo '```'
        echo
        echo "</details>"
      fi
    done
    echo
    echo "### Catálogo de exercícios"
    echo
    echo "- Exercícios em \`$CURRENT\`: $EX_OLD; em \`$LATEST\`: $EX_NEW (novos: $EX_ADDED, removidos: $EX_REMOVED)."
    echo
    echo "## Conflitos"
    echo
    if [ -z "$CONFLICTS" ]; then
      if [ "$MERGE_STATE" = "feito sem conflitos" ]; then
        echo "Nenhum."
      else
        echo "Não se aplica (merge: $MERGE_STATE)."
      fi
    else
      echo "O merge parou com conflitos. Cada arquivo está classificado:"
      echo
      printf '%s\n' "$CONFLICTS" | while IFS= read -r f; do
        [ -n "$f" ] || continue
        case "$(classify_path "$f")" in
          camada)   echo "- \`$f\` — **camada do GYM 12**: manter a nossa versão e adaptar ao que mudou." ;;
          original) echo "- \`$f\` — **arquivo original alterado pelo GYM 12** (listado no GYM12_CHANGES.md): partir da versão do openGym e reaplicar só as nossas linhas marcadas." ;;
          *)        echo "- \`$f\` — **outro arquivo**: não deveria ter mudança nossa; normalmente fica a versão do openGym (\`git checkout --theirs\`)." ;;
        esac
      done
    fi
    echo
    echo "## Testes"
    echo
    echo "- npm ci: $NPM_CI_STATE"
    echo "- Testes: $TEST_STATE${TEST_TOTALS:+ ($TEST_TOTALS)}"
    if [ -n "$TEST_FAILED_LIST" ]; then
      echo "- Falhas (as conhecidas do openGym são toleradas):"
      printf '%s\n' "$TEST_FAILED_LIST" | sed 's/^\(.*\)$/  - `\1`/'
    fi
    if [ -n "$TEST_NEW_FAILURES" ]; then
      echo "- **Falhas novas** (reprovam a atualização):"
      printf '%s\n' "$TEST_NEW_FAILURES" | sed 's/^\(.*\)$/  - `\1`/'
    fi
    echo
    echo "## Build"
    echo
    echo "- \`$BUILD_SCRIPT\`: $BUILD_STATE"
    echo
    echo "## Prévia"
    echo
    echo "- $PREVIEW_STATE${PREVIEW_URL:+: $PREVIEW_URL}"
    [ -n "$PREVIEW_NOTE" ] && printf '%s\n' "$PREVIEW_NOTE" | sed 's/^/- /'
    echo
    echo "## Próximos passos"
    echo
    if [ -n "$CONFLICTS" ]; then
      echo "1. Resolva os conflitos no branch \`$SYNC_BRANCH\` seguindo a classificação acima e as regras da camada fina do \`GYM12_CHANGES.md\`."
      echo "2. \`git add\` nos arquivos resolvidos e \`git commit --no-edit\`."
      echo "3. Rode \`cd frontend && npm ci && npm test\` e \`$BUILD_SCRIPT\`."
      echo "4. Publique a prévia: \`npx --yes wrangler@$WRANGLER_VER pages deploy frontend/dist --project-name $CF_PROJECT --branch $DEPLOY_BRANCH\`."
      echo "5. Abra a prévia, confira, e se estiver tudo certo rode: \`git checkout $BASE_BRANCH && git merge --ff-only $SYNC_BRANCH && git push $ORIGIN_REMOTE $BASE_BRANCH\`"
    else
      echo "Abra a prévia, confira, e se estiver tudo certo rode: \`git checkout $BASE_BRANCH && git merge --ff-only $SYNC_BRANCH && git push $ORIGIN_REMOTE $BASE_BRANCH\`"
    fi
  } > "$SUMMARY"
  cp "$SUMMARY" "$LOG_DIR/RESUMO.md"
}

# ---------------------------------------------------------------------------------------------
# 3. Merge no branch sync/<tag>
# ---------------------------------------------------------------------------------------------
say "Criando $SYNC_BRANCH a partir de $BASE_BRANCH…"
git checkout -q -b "$SYNC_BRANCH" "$BASE_BRANCH"
[ "$(current_branch)" = "$SYNC_BRANCH" ] || die "não estou em $SYNC_BRANCH; parando antes do merge."

say "Fazendo merge de $LATEST…"
if git merge -q --no-ff --no-edit -m "sync: openGym $LATEST" "$LATEST" > "$LOG_DIR/merge.log" 2>&1; then
  MERGE_STATE="feito sem conflitos"
else
  CONFLICTS=$(git diff --name-only --diff-filter=U)
  if [ -z "$CONFLICTS" ]; then
    cat "$LOG_DIR/merge.log" >&2
    git merge --abort >/dev/null 2>&1 || true
    git checkout -q "$ORIG_BRANCH"
    git branch -D "$SYNC_BRANCH" >/dev/null 2>&1 || true
    die "o merge falhou sem conflitos (veja acima). Voltei para $ORIG_BRANCH."
  fi
  MERGE_STATE="parou com conflitos"
  write_summary
  echo
  echo "Conflitos no merge de $LATEST:"
  printf '%s\n' "$CONFLICTS" | while IFS= read -r f; do printf '  [%s] %s\n' "$(classify_path "$f")" "$f"; done
  echo "Resumo: $SUMMARY_REL"
  if [ "$ABORT_ON_CONFLICT" = 1 ]; then
    git merge --abort
    git checkout -q "$ORIG_BRANCH"
    git branch -D "$SYNC_BRANCH" >/dev/null
    echo "Merge desfeito (--abort-on-conflict) e $SYNC_BRANCH apagado. Voltei para $ORIG_BRANCH."
    echo "O resumo ficou em $SUMMARY_REL (arquivo não commitado; cópia em $LOG_DIR/RESUMO.md)."
  else
    echo
    echo "ATENÇÃO: deixei o branch $SYNC_BRANCH no estado de conflito para uma pessoa resolver."
    echo "Você continua em $SYNC_BRANCH (NÃO voltei para $ORIG_BRANCH). Os passos estão no resumo."
    echo "Para desistir: git merge --abort && git checkout $ORIG_BRANCH && git branch -D $SYNC_BRANCH"
  fi
  exit 2
fi

# ---------------------------------------------------------------------------------------------
# 4. npm ci, testes e build
# ---------------------------------------------------------------------------------------------
OK=1
say "Instalando dependências (npm ci)…"
if (cd frontend && npm ci) > "$LOG_DIR/npm-ci.log" 2>&1; then
  NPM_CI_STATE="ok"
else
  NPM_CI_STATE="falhou (veja npm-ci.log)"
  OK=0
fi

if [ "$NPM_CI_STATE" = ok ]; then
  say "Rodando os testes…"
  rm -f "$LOG_DIR/vitest.json"
  set +e
  (cd frontend && npm test -- --reporter=default --reporter=json --outputFile.json="$LOG_DIR/vitest.json") \
    > "$LOG_DIR/tests.log" 2>&1
  set -e
  if [ -s "$LOG_DIR/vitest.json" ]; then
    TEST_TOTALS=$(node -e '
      const r = require(process.argv[1]);
      console.log(`${r.numTotalTests} testes: ${r.numPassedTests} passaram, ${r.numFailedTests} falharam, ${r.numPendingTests + (r.numTodoTests || 0)} pulados; ${r.testResults.filter(f => f.status === "failed").length} de ${r.testResults.length} arquivos com falha`);
    ' "$LOG_DIR/vitest.json")
    node -e '
      const r = require(process.argv[1]);
      for (const f of r.testResults) {
        const file = f.name.replace(/^.*?\/frontend\//, "");
        const failed = f.assertionResults.filter(a => a.status === "failed");
        if (f.status === "failed" && failed.length === 0) console.log(`${file} > (o arquivo não carregou)`);
        for (const a of failed) console.log(`${file} > ${a.fullName}`);
      }
    ' "$LOG_DIR/vitest.json" > "$LOG_DIR/failed-tests.txt"
    TEST_FAILED_LIST=$(cat "$LOG_DIR/failed-tests.txt")
    TEST_NEW_FAILURES=$(grep -Fxv -f <(printf '%s\n' "$KNOWN_FAILURES") "$LOG_DIR/failed-tests.txt" || true)
    if [ -z "$TEST_NEW_FAILURES" ]; then
      TEST_STATE="ok (só as falhas conhecidas do openGym)"
      [ -z "$TEST_FAILED_LIST" ] && TEST_STATE="ok"
    else
      TEST_STATE="falhou: há falhas novas"
      OK=0
    fi
  else
    TEST_STATE="falhou: não consegui ler o resultado (veja tests.log)"
    OK=0
  fi

  if [ -f "$BUILD_SCRIPT" ]; then
    say "Rodando o build ($BUILD_SCRIPT)…"
    if bash "$BUILD_SCRIPT" > "$LOG_DIR/build.log" 2>&1; then
      BUILD_STATE="ok"
    else
      BUILD_STATE="falhou (veja build.log)"
      OK=0
    fi
  else
    BUILD_STATE="falhou: $BUILD_SCRIPT não existe"
    OK=0
  fi
fi

# ---------------------------------------------------------------------------------------------
# 6. Prévia (nunca produção)
# ---------------------------------------------------------------------------------------------
PUSHED=0
PREVIEW_FAILED=0
if [ "$OK" != 1 ]; then
  PREVIEW_STATE="não publicada: testes ou build falharam"
elif [ "$PREVIEW" != 1 ]; then
  PREVIEW_STATE="não publicada (--no-preview)"
  PREVIEW_NOTE="Para publicar depois: git push -u $ORIGIN_REMOTE $SYNC_BRANCH && npx --yes wrangler@$WRANGLER_VER pages deploy frontend/dist --project-name $CF_PROJECT --branch $DEPLOY_BRANCH"
else
  say "Conferindo login do wrangler…"
  WHOAMI=$(npx --yes wrangler@$WRANGLER_VER whoami 2>&1 || true)
  if printf '%s' "$WHOAMI" | grep -qiE 'not authenticated|not logged in|wrangler login'; then
    PREVIEW_STATE="não publicada: o wrangler não está logado"
    PREVIEW_NOTE="Rode \`npx --yes wrangler@$WRANGLER_VER login\` (abre o navegador) e depois: git push -u $ORIGIN_REMOTE $SYNC_BRANCH && npx --yes wrangler@$WRANGLER_VER pages deploy frontend/dist --project-name $CF_PROJECT --branch $DEPLOY_BRANCH"
    warn "o wrangler não está logado. Rode: npx --yes wrangler@$WRANGLER_VER login — e depois rode o deploy da prévia (está no resumo)."
    PREVIEW_FAILED=1
  else
    guard_push_branch "$SYNC_BRANCH"
    say "Enviando $SYNC_BRANCH ao $ORIGIN_REMOTE…"
    if git push -u "$ORIGIN_REMOTE" "$SYNC_BRANCH" > "$LOG_DIR/push.log" 2>&1; then
      PUSHED=1
      guard_deploy_branch "$DEPLOY_BRANCH"
      say "Publicando a prévia (branch $DEPLOY_BRANCH)…"
      if npx --yes wrangler@$WRANGLER_VER pages deploy frontend/dist --project-name "$CF_PROJECT" --branch "$DEPLOY_BRANCH" \
           > "$LOG_DIR/deploy.log" 2>&1; then
        PREVIEW_URL=$(grep -oE 'https://[A-Za-z0-9.-]+\.pages\.dev[^[:space:]]*' "$LOG_DIR/deploy.log" | tail -n 1 || true)
        PREVIEW_STATE="publicada"
        [ -n "$PREVIEW_URL" ] || PREVIEW_NOTE="Não achei o endereço na saída do wrangler; veja deploy.log."
      else
        PREVIEW_STATE="falhou o deploy (veja deploy.log)"
        PREVIEW_FAILED=1
      fi
    else
      PREVIEW_STATE="não publicada: o push de $SYNC_BRANCH falhou (veja push.log)"
      PREVIEW_FAILED=1
    fi
  fi
fi

# ---------------------------------------------------------------------------------------------
# 5. Resumo + commit dele no branch sync/<tag>
# ---------------------------------------------------------------------------------------------
write_summary
[ "$(current_branch)" = "$SYNC_BRANCH" ] || die "não estou em $SYNC_BRANCH; não vou commitar o resumo."
git add -- "$SUMMARY_REL"
git commit -q -m "sync: resumo da atualização para openGym $LATEST" -- "$SUMMARY_REL"
if [ "$PUSHED" = 1 ]; then
  guard_push_branch "$SYNC_BRANCH"
  git push -q "$ORIGIN_REMOTE" "$SYNC_BRANCH" >> "$LOG_DIR/push.log" 2>&1 \
    || warn "não consegui enviar o commit do resumo; rode: git push $ORIGIN_REMOTE $SYNC_BRANCH"
fi

# ---------------------------------------------------------------------------------------------
# 7. Volta ao branch original
# ---------------------------------------------------------------------------------------------
git checkout -q "$ORIG_BRANCH"
echo
echo "Merge: $MERGE_STATE"
echo "Testes: $TEST_STATE${TEST_TOTALS:+ ($TEST_TOTALS)}"
echo "Build: $BUILD_STATE"
echo "Prévia: $PREVIEW_STATE${PREVIEW_URL:+ — $PREVIEW_URL}"
echo "Resumo: $SUMMARY_REL no branch $SYNC_BRANCH (cópia em $LOG_DIR/RESUMO.md)"
echo "Ler: git show $SYNC_BRANCH:$SUMMARY_REL"
echo "De volta em $ORIG_BRANCH."

if [ "$OK" != 1 ]; then
  [ -n "$TEST_NEW_FAILURES" ] && printf 'Falhas novas nos testes:\n%s\n' "$TEST_NEW_FAILURES" >&2
  exit 1
fi
[ "$PREVIEW_FAILED" = 1 ] && exit 1
exit 0
