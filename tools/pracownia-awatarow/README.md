# Pracownia awatarów

Skrypt robi z 1–3 zdjęć dziecka postać w stylu filmów animowanych 3D (Gemini, „Nano Banana”)
i krótkie animacje tej postaci (Veo): `idle`, `cheer`, `oops`, `dance`. Opisy 20 stylów są w `styles.json`.

```
export GEMINI_API_KEY=...            # klucz z Google AI Studio (płatny poziom)
export NODE_USE_ENV_PROXY=1          # tylko gdy ruch idzie przez proxy
node generate.mjs --list-models
node generate.mjs --style kotek --pet --variants 2                 # pokaz stylu bez zdjęć
node generate.mjs --photos a.jpg,b.jpg --style kotek --out out/maja --motions idle,cheer
```

Orientacyjne koszty (październik 2026): obraz 0,07–0,13 $, klip 4–5 s 0,25–0,50 $.
Zdjęć dzieci nie trzymamy w repozytorium; `out/` jest ignorowane.
