#!/usr/bin/env bash
# GYM 12: o build único (Cloudflare Pages e qualquer outra ferramenta chamam este script).
# Saída em frontend/dist. GYM12_MEDIA=1 inclui a mídia dos exercícios.
# Pressupõe as dependências instaladas (cd frontend && npm ci).
set -euo pipefail
cd "$(dirname "$0")/../frontend"
npx vite build --config vite.gym12.config.js
node src/gym12/scripts/postbuild.mjs dist
