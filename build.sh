#!/bin/sh
# Składa jeden plik index.html z części w src/ (strona publikowana jako jeden plik).
set -e
cd "$(dirname "$0")"
{
  cat src/01-head.html
  echo '<header id="hdr" class="hdr"></header>'
  echo '<div id="banner" class="banner" hidden></div>'
  echo '<main id="app"></main>'
  echo '<script>'
  cat src/02-avatar.js src/03-store.js src/04-views.js src/05-panels.js src/06-games.js src/07-avatar3d.js
  echo 'boot();'
  echo '</script>'
} > index.html
# Strona na claude.ai nie serwuje .glb: każdą postać pakujemy też jako .glb.json (base64)
for f in postacie/*.glb; do
  printf '{"b64":"%s"}' "$(base64 -w0 "$f")" > "$f.json"
done
