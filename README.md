# Kraina Gier 2D

Prototyp portalu z mini grami edukacyjnymi dla klasy 2D szkoły podstawowej, do grania na tablicy interaktywnej i w domu.

Wersja online (claude.ai, wspólna baza i AI): https://claude.ai/artifact/3oz22K6rb7hEGJZqgwAK3g

## Co jest w środku

- **Konta dzieci**: e-mail rodzica + 4-cyfrowy PIN (wpisywany dwa razy), potwierdzenie e-maila kodem, „Zapomniałem PIN-u”, imię dziecka. Po 5 błędnych PIN-ach logowanie blokuje się na minutę.
- **Awatary**: do 3 zdjęć dziecka, 20 stylów (superbohater, astronauta, kotek, dinozaur, wróżka, robot…), cała animowana postać (oddycha, mruga, macha, skacze przy dobrej odpowiedzi, tańczy po wygranej). Na claude.ai zdjęcia ogląda Claude i dobiera kolor skóry, włosów i oczu, fryzurę, okulary, piegi, spinkę. Zdjęcia nie są zapisywane, zapisuje się tylko narysowana postać.
- **Gotowe postacie 3D**: 16 ruchomych postaci (8 ludzików Kenney „Mini Characters” i 8 stworków Quaternius, licencja CC0) z animacjami: macha, skacze, cieszy się, smuci, tańczy. Pliki `.glb` i miniatury są w `postacie/`, katalog w `src/07-avatar3d.js` (`CHARS3D`).
- **10 gier** (każda z 3 etapami, 8 pytań, 0–3 gwiazdki):
  | Gra | Obszar | Czego uczy |
  |---|---|---|
  | Rakieta liczb | matematyka | dodawanie i odejmowanie do 100, okienka |
  | Koszyki jabłek | matematyka | mnożenie i dzielenie do 30 |
  | Zegarmistrz | matematyka | pełne godziny, wpół do, kwadranse, 24 h |
  | Sklepik | matematyka | płacenie monetami, reszta |
  | Ortograficzne balony | polski | ó/u, rz/ż, ch/h |
  | Alfabetowy pociąg | polski | kolejność alfabetyczna |
  | Koszyki słów | polski | rzeczownik, czasownik, przymiotnik |
  | Eko-sortownia | przyroda | segregacja odpadów (5 pojemników) |
  | English Memory | angielski | kolory, zwierzęta, jedzenie z wymową |
  | Most przyjaźni | razem | gra kooperacyjna dla dwojga na tablicy |
- **Panel nauczyciela**: plac zabaw z awatarami całej klasy, wybór 1–2 dzieci do gry przy tablicy, losowanie dziecka, zadania domowe jako ścieżka kroków (cała klasa albo wybrane dzieci), automatyczne zadania dopasowane do najsłabszego obszaru każdego dziecka, czas gry i wyniki każdego dziecka.
- Czytanie poleceń na głos (🔊), dźwięki, pełny ekran na tablicę.

## Dane

- Na claude.ai: wspólna baza strony (konta, postacie, wyniki, zadania). Zapisywać mogą osoby zaproszone do strony z uprawnieniem do edycji.
- Poza claude.ai (np. otwarty plik `index.html`): tryb pokazowy z przykładowymi dziećmi, wszystko zapisuje się tylko w przeglądarce.
- E-maile z kodami są w prototypie symulowane: pojawiają się w „Poczcie” w prawym górnym rogu.
- Konto nauczyciela na start: `nauczyciel@klasa2d.pl`, PIN `2222` (zmień w Ustawieniach). Przykładowe dzieci w pokazie mają PIN `1111`.

## Budowanie

Kod jest w `src/`, a `./build.sh` skleja go w jeden plik `index.html`.

```
./build.sh
```

## Na później

- Własny hosting (np. GitHub Pages) z bazą Supabase i prawdziwą wysyłką e-maili (np. Resend).
- Generowanie ilustracji postaci modelem obrazów, wiele klas i szkół, więcej gier (kalendarz, termometr, cyfry rzymskie, sylaby).
- Badanie podstawy programowej: https://claude.ai/artifact/Wcde8Xkbxx12UeAmUVN2gg
