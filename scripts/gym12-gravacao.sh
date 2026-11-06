#!/usr/bin/env bash
# GYM 12 · gravação: o build de gravação do Reel (frontend/dist-gravacao), só para gravar as telas
# do app em localhost. Nunca é publicado; o build de produção continua sendo scripts/gym12-build.sh.
#   scripts/gym12-gravacao.sh            build + mídia dos exercícios (cópia de catalogue/media)
#   scripts/gym12-gravacao.sh --serve    o mesmo e depois serve em http://127.0.0.1:4430/
# Pressupõe as dependências instaladas (cd frontend && npm ci). Gravador:
# frontend/src/gym12/gravacao/gravar.mjs (veja o cabeçalho dele).
set -euo pipefail
cd "$(dirname "$0")/../frontend"
export GYM12_MEDIA="${GYM12_MEDIA:-1}"
unset VITE_TESTE_LICENCA GYM12_AMBIENTE
npx vite build --config vite.gravacao.config.js --emptyOutDir
node src/gym12/scripts/postbuild.mjs dist-gravacao
if [ "${1:-}" = "--serve" ]; then exec npx vite preview --config vite.gravacao.config.js; fi
