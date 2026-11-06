#!/usr/bin/env bash
# GYM 12: o build único (Cloudflare Pages e qualquer outra ferramenta chamam este script).
# Saída em frontend/dist (ou em GYM12_DIST, relativo a frontend/). A mídia dos exercícios entra por
# padrão (cópia byte a byte de catalogue/media, com o NOTICE.md); GYM12_MEDIA=0 a deixa de fora.
# Pressupõe as dependências instaladas (cd frontend && npm ci).
set -euo pipefail
cd "$(dirname "$0")/../frontend"
export GYM12_MEDIA="${GYM12_MEDIA:-1}"
DIST="${GYM12_DIST:-dist}"
npx vite build --config vite.gym12.config.js --outDir "$DIST" --emptyOutDir
node src/gym12/scripts/postbuild.mjs "$DIST"
