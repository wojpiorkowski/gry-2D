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
  cat src/02-avatar.js src/03-store.js src/04-views.js src/05-panels.js src/06-games.js
  echo 'boot();'
  echo '</script>'
} > index.html
