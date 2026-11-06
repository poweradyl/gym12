#!/usr/bin/env bash
# GYM 12: o build do AMBIENTE DE TESTE (nunca o de produção). Saída em frontend/dist-teste, para não
# misturar com o frontend/dist de produção. Liga:
#   GYM12_AMBIENTE=teste     noindex (meta robots, X-Robots-Tag no _headers, robots.txt Disallow: /)
#   VITE_TESTE_LICENCA=1     a variante da tela de Licenças (gym12/LicencasTeste.jsx)
# O plugin recusa VITE_TESTE_LICENCA fora de GYM12_AMBIENTE=teste e, no Cloudflare Pages, fora do
# branch teste-licenca. Publicar: npx wrangler pages deploy frontend/dist-teste --project-name gym12 --branch teste-licenca
set -euo pipefail
export GYM12_AMBIENTE=teste
export VITE_TESTE_LICENCA=1
export GYM12_DIST="${GYM12_DIST:-dist-teste}"
exec "$(dirname "$0")/gym12-build.sh"
