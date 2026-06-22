# Astromine V2 — Langzeitmotivation: Konzept B & C

Gilt für `astromine-v2.html` (eigener Save-Key `…-v2`). Detailkonzept für
**B – Veredelungsketten / Endprodukte** und **C – Megastrukturen**, plus Querschnitt
**E – Offline-Fortschritt**. Roter Faden: **B → C** (kein Prestige).

**Stand:** Dieses Dokument enthält die nach deinem Feedback **festgelegten Entscheidungen**.
Offen ist nur noch die finale Megastruktur-Auswahl (Pool unter C.2 markiert „in Auswahl").

---

## 0. Ausgangslage (woran wir andocken)

- **12 Ressourcen** in Tiers `t:0..4` (`RES`), Vorkommen **endlich**, keine Regeneration.
- **Raffinerie pro System** (`G().refinery[idx]={lvl,recipes:{rid:{on,acc}}}`), `RECIPES` mit
  `in/out/unlock`, `refineryTick` zieht aus dem **System-Lager** (`G().store`).
- **Per-System-Lager** + **Routen/Schiffe** (laden nur an Stationen, ausladen überall, Multi-Stop,
  Teilmengen). Das ist die zentrale Logistik, die B und C voll auslasten sollen.
- **Endpunkt heute:** Kette endet an der Raffinerie. Es fehlt der Grund, weiterzuveredeln und
  Güter zu *bewegen*. Genau das liefert B; C ist die Senke dafür.

**Spielgedanke:** ruhiges, deterministisches Erkunden + Aufbau eines *logistischen* Bergbau-Imperiums.
Planungstiefe, kein Klickdruck. B/C müssen Planung belohnen, nicht Tempo.

**Endspiel-Vision (entschieden):** **praktisch endlos.** 2000 Systeme liefern faktisch unbegrenzten
Nachschub; es gibt **kein hartes Ende**. Ressourcen bleiben **strikt endlich** (keine Regeneration,
kein Prestige). Megastrukturen sind die Langzeitziele der Spätphase, kein „Abschluss".

---

## B. Veredelungsketten / Endprodukte

### B.1 Ziel
Aus der einstufigen Raffinerie wird ein **mehrstufiger Produktionsbaum**: Rohstoffe → Halbzeuge →
Komponenten → Module/Endprodukte. Endprodukte sind v. a. Input für Megastrukturen (C) und einige
dauerhafte Spätspiel-Boni. Logistik wird dadurch zur Kerndisziplin.

### B.2 Materialebenen *(festgelegt: gut so)*
Vier Stufen über den Rohstoffen, bewusst wenige (Lesbarkeit):

| Stufe | Name | Beispiele | Anlage |
|------|------|-----------|--------|
| R | Rohstoffe (vorhanden) | Eisen, Nickel, Silikate, Eis, Helium-3, … | Abbau |
| P1 | Halbzeuge / Werkstoffe | Stahl, Glas, Keramik, Treibstoff | Schmelze |
| P2 | Komponenten | Legierungsplatten, Schaltkreise, Brennzellen | Fabrik |
| P3 | Module | Antriebs-, Habitat-, Sensormodul, Reaktorkern | Werft |
| P4 | Endprodukte / Mega-Segmente | je nach Megastruktur | Werft (Spätspiel) |

Beispielrezepte (Werte = Platzhalter fürs Balancing):

```
Stahl        : 4 Eisen + 1 Kohlenstoff             -> 2 Stahl          (Schmelze)
Glas         : 3 Silikate + 1 Wassereis            -> 2 Glas           (Schmelze)
Treibstoff   : 2 Methaneis + 1 Helium-3            -> 2 Treibstoff     (Schmelze)
Legierungspl.: 3 Stahl + 1 Nickel                  -> 2 Legierungspl.  (Fabrik)
Schaltkreis  : 1 Seltene Erden + 2 Kristalle       -> 1 Schaltkreis    (Fabrik)
Brennzelle   : 1 Helium-3 + 1 Exotische Materie    -> 1 Brennzelle     (Fabrik)
Antriebsmodul: 2 Legierungspl. + 1 Brennzelle + 1 Treibstoff -> 1 Antriebsmodul (Werft)
Habitatmodul : 2 Glas + 2 Legierungspl. + 1 Biomasse         -> 1 Habitatmodul  (Werft)
```

Regeln: höhere Stufen verbrauchen **mehrere verschiedene** Vorstufen (erzwingt Vielfalt → Routen),
und sind **langsam** (kleiner Durchsatz) statt nur teuer.

### B.3 Spezialisierte Anlagen *(festgelegt)*
Drei Anlagentypen, je **pro System** baubar (analog Station/Raffinerie):
**Schmelze (P1)**, **Fabrik (P2)**, **Werft (P3/P4)**. So entstehen Produktionsstandorte, zwischen
denen Schiffe pendeln — die Galaxie wird zur Lieferkette.

- Technisch: `refinery`-Struktur generalisieren → `G().plants[idx][typ]={lvl,recipes}`.
  `refineryTick` → `plantsTick`, das je Anlagentyp nur erlaubte Rezepte zulässt
  (Rezeptfeld `plant:"schmelze"|"fabrik"|"werft"`).
- **Ausbaustufen:** ja, jede Anlage hat Stufen für mehr Durchsatz (wie `refinery.lvl`); Stufenkosten
  skalieren innerhalb der Materialstufe, die die Anlage ohnehin verarbeitet. (Sekundär, kann später fein.)

### B.4 Logistik-Synergie (der Kern)
Endprodukte sind **nicht lokal aus dem Nichts** machbar: ein Antriebsmodul braucht Treibstoff
(gasreiches System), Legierungsplatten (eisenreich), eine Brennzelle (exotische Materie, selten).
Der Spieler wählt Standorte nach Vorkommen (→ **Lesezeichen-Notizen werden praktisch relevant**),
führt Vorprodukte per Route zusammen und fertigt am Werft-Standort. Damit wird die vorhandene
Logistik *zwingend* statt optional.

### B.5 UI — Übersichtlichkeit ist Pflicht *(verschärfte Anforderung)*
**Wichtigste Designvorgabe:** Auch mit *allen* Anlagen in einem System muss es ruhig und lesbar bleiben
(es gibt **kein Bauplatz-Limit**, daher trägt allein die UI die Übersicht).

- **Produktionsbaum-Overlay** (analog `#ups`/`#statswin`): R→P1→P2→P3 als klarer Graph, Freischalt-
  zustand + „pro Sekunde"-Durchsatz. Eine Stelle, an der man die ganze Kette versteht.
- **System-Panel:** je Anlage ein **eigener, einklappbarer Block** (Standard: eingeklappt → nur
  Kopfzeile mit Typ, Stufe, Durchsatz, Status). Aufgeklappt erst die Rezeptliste. So bleibt ein
  Vollausbau-System eine kurze Liste statt einer Textwand.
- **Pro-System-Zusammenfassung** oben: „Schmelze L3 · Fabrik L2 · Werft L1" als kompakte Chips.
- Ressourcenleiste/Statistik nach **Stufe filterbar** (R/P1/P2/P3), sonst wird die Leiste zu voll.

### B.6 Gating & Progression *(korrigiert — Materialkette IST das Gating)*
Kein Gating über erkundete Systeme oder Meilensteine. Stattdessen baut die **Anlagenkette
aufeinander auf**, allein über Baukosten:

```
Raffinerie (vorhanden)
   └─ Schmelze        Baukosten: NUR Roh-/Basismaterialien (R)
        └─ Fabrik     Baukosten: dürfen bereits Schmelze-Material (P1) enthalten
             └─ Werft Baukosten: dürfen bereits Fabrik-Material (P2) enthalten
```

**Invariante (zwingend einzuhalten):** Die Baukosten einer Anlage referenzieren ausschließlich
Materialien, die zu diesem Zeitpunkt **schon herstellbar** sind — nie ein Material, das erst diese
oder eine spätere Anlage produziert. Dadurch ist die Reihenfolge automatisch erzwungen, ganz ohne
Flags. Gleiches Prinzip für Anlagen-Ausbaustufen (höhere Stufe darf höherwertiges, aber bereits
verfügbares Material kosten). Beim Definieren der Rezepte/Kosten ist diese Abhängigkeitsrichtung
strikt einzuhalten (Lint-Gedanke: jedes Kostenmaterial muss in einer *früheren* Anlage entstehen).

### B.7 Passt das? — Ja
Verlängert die Schleife organisch nach hinten, macht Routen zentral, belohnt Standortwahl (Lesezeichen).
Hauptrisiko bleibt UI-Überladung → B.5 ist deshalb harte Anforderung, nicht Kür.

### B.8 Schiffe in der Werft bauen *(umgesetzt)*
Schiffe werden **nicht mehr an der Handelsstation gekauft**, sondern in der **Werft gebaut** – ein Schiff
ist damit ein echtes Endprodukt der Kette. Identitätsbasiertes Modell: jedes Schiff = `{id,name,call,type,cap,loc}`,
`loc` = Systemidx (angedockt) oder −1 (unterwegs); die Station ist nur noch Andockpunkt/Lager.

- **Zwei Typen (gestaffelt):** **Kurier** (Bau aus P1/P2, Kapazität 250, 90 s) – früh erreichbar, geringe Fracht;
  **Frachter** (Bau aus P3-Modulen, Kapazität 1200, 150 s) – große Fracht. Mindestbauzeit 90 s.
- **Sequenzielle Warteschlange:** die Werft baut immer nur ein Schiff zugleich, weitere reihen sich ein;
  Material wird beim Einreihen reserviert. Parallel laufen die P3-Modul-Rezepte weiter.
- **Kapazität** wird im Routenplaner angezeigt und begrenzt das Lade-Manifest (Start = stärkstes freies Schiff).
- **Galaxie-Freischaltung:** sobald das erste Schiff existiert (Sol mit Station vorausgesetzt). Da Schiffe die
  Werft-Kette voraussetzen, öffnet sich die Galaxie bewusst etwas später – der frühe **Kurier** hält den Vorlauf kurz.
- Beim Stapellauf rollt Name + Kennung; beide in der Stations-Flottenliste editierbar.

---

## C. Megastrukturen *(umgesetzt)*

**Implementiert (per-System-Modell):** generische Engine (`MEGADEF`/`G().mega[sysIdx][key]`), Freischaltung
ab erster Werft. Je 4 Phasen mit „Bau starten"-Button im Stern-Panel (zieht aus dem System-Lager) +
Montagezeit; sichtbare Ringe im System + Hinweis in der Galaxie-Systeminfo. **Überblick aller
Megastrukturen + Baubarkeit** in der Statistik (`#stmega`).
Boni bei Fertigstellung: **Dyson** +15 % Anlagen-Durchsatz **im jeweiligen System**, **je System einmal**
baubar, deutlich teurer (`dysonMult(idx)`); **Temporaler Verstärker** +30 % Tempo im System (`sysSpeed`,
auch Förderer/Werft, je System einmal); **Versorgungs-Nexus** (nur an Sgr A*, global einmalig) lässt
`canAfford`/`spend` aus dem Lager aller Systeme zahlen (`nexusActive`). Per Node verifiziert.
Hinweis: die feste Reihenfolge/„eine zur Zeit" aus C.2–C.5 ist durch das per-System-Modell ersetzt.

### C.1 Ziel *(Grundkonzept festgelegt: gut)*
Wenige, sehr teure Großprojekte als Langzeit-Senke für B-Endprodukte und als sichtbares Statussymbol.
Sie geben **Boni** und sind das „Wozu" der Spätphase.

### C.2 Auswahl & Effekte *(festgelegt — 3 Strukturen)*
Finale Auswahl, in Freischalt-Reihenfolge. Drei bewusst *unterschiedliche* Belohnungsachsen:
galaxisweite Produktion, lokaler Tempo-Boost, Logistik/Ökonomie.

| # | Megastruktur | Ort | Effekt |
|---|--------------|-----|--------|
| 1 | **Dyson-Schwarm** | um einen Stern (Trägersystem) | +15 % Durchsatz **aller Anlagen** galaxisweit (Produktion) |
| 2 | **Temporaler Verstärker** | beliebiges System | **+30 % Tempo im Trägersystem** (Förderer + Anlagen ticken dort schneller) — strategisch ins stärkste Produktionssystem |
| 3 | **Versorgungs-Nexus** | **nur im Orbit um Sagittarius A\*** | **Zentrallager**: galaxisweit gemeinsamer Puffer, aus dem jedes System bauen/fertigen kann |

**Hinweise:**
- **Temporaler Verstärker:** fester **+30 %** auf die Tick-Rate *nur* des Trägersystems (kein
  galaxisweiter Effekt). **Nur einer erlaubt**, damit er nicht zusammen mit dem Dyson-Bonus zum
  Balancing-Loch wird. Da er den Vorkommen-Verbrauch im Trägersystem mit erhöht, ist die Standortwahl
  eine echte Abwägung.
- **Versorgungs-Nexus:** Bauort an **Sagittarius A\*** gebunden (Landmarke `LMS`) — man muss das
  galaktische Zentrum erreicht haben. Thematischer Spätspiel-Gate und Krönung der Reihe.

### C.3 Bau-Mechanik *(festgelegt)*
- Datenmodell: `G().mega[idx]={typ, phase, montageT, done}` (kein eigener Liefer-Puffer nötig).
- **Lieferung ins normale System-Lager:** Endprodukte werden wie alles andere per Route ans
  Baustellen-System geliefert und landen im **System-Lager** (`G().store[idx]`). Kein gesondertes
  „Einbauen" beim Ausladen.
- **Bau-Start per Button:** Sind genug Ressourcen der aktuellen Phase im Lager, lässt sich die Phase
  per Klick starten. Der Klick **zieht die Materialien aus dem Lager** (`spend`) und startet die Montage.
  Der Button bleibt deaktiviert, solange das Lager nicht reicht (Live-Aktualisierung wie bei `data-cost`).
- **Genau 4 Phasen** je Struktur. **Jede Phase verlangt ein ANDERES Set an Endprodukten** — kein
  Material wird über mehrere Phasen wiederholt angeliefert.
- **Montagezeit je Phase** nach dem Start (gibt dem Bau Gewicht/Impact). Während der Montage sichtbarer
  Fortschritt; danach ist die Phase fertig und die nächste freigegeben.

### C.4 Sichtbarkeit *(festgelegt)*
- **Im System sichtbar gerendert**, Ausbaustand visuell ablesbar (z. B. Dyson-Ring wächst je Phase).
- **In der Galaxie-Systeminfo erkennbar**: das System-Panel zeigt, welche Megastruktur dort steht
  bzw. im Bau ist — man weiß jederzeit, was man schon gebaut hat. Zusätzlich dezenter Marker am Stern.

### C.5 Freischaltung & Reihenfolge *(festgelegt)*
- Megastrukturen werden **erst spät** freigeschaltet (volle Veredelungskette + erste P3/P4 vorhanden).
- **Immer nur EINE gleichzeitig verfügbar/baubar.** Ist sie fertig, wird die **nächste** freigeschaltet,
  sofern deren Voraussetzungen erfüllt sind → klare, gestaffelte Spätspiel-Reihe.
- **Reihenfolge (final):** ① Dyson-Schwarm → ② Temporaler Verstärker → ③ Versorgungs-Nexus
  (③ zusätzlich gegated über das Erreichen von Sagittarius A\*).

### C.6 Passt das? — Ja
Krönender Abschluss der Logistikkette, Endgame-Ziel ohne Prestige. Da das Endspiel **praktisch endlos**
ist, koexistieren endliche Vorkommen und große Bauprojekte problemlos (genug Systeme als Nachschub).

---

## E. Offline-Fortschritt *(umgesetzt)*
- Beim Einloggen werden **10 % der Online-Produktionsrate** für die – gedeckelte – Abwesenheit
  gutgeschrieben (**Förderer + Raffinerie + Anlagen**). Transits **ruhen** offline und laufen bei
  Rückkehr weiter (v1-Vereinfachung; „Routen normal nachrechnen" ggf. später).
- **Deckel: 1 h**, per Ausbau **„Offline-Speicher"** um je 1 h erhöhbar.
- Technisch: Zeitstempel `SAVE.ts` (in `persist()`); beim Start `applyOffline()` – gedeckeltes Delta
  ×0,10, Förderer-Systeme werden dafür in den Cache geladen, Raffinerie/Anlagen per Einmal-Tick mit
  großem dt. Erst ab 1 min Abwesenheit.
- **Anzeige beim Start:** dauerhafter Hinweis „Während deiner Abwesenheit (Dauer · 10 %): +N Einheiten ·
  Top-Ressourcen" (Transparenz, kein stilles Gutschreiben). Verifiziert via Node-Zweipass-Test.

---

## Entschiedene Punkte (Referenz)
- **B.2 Materialebenen:** übernommen.
- **B.3 spezialisierte Anlagen:** Variante 2, umgesetzt.
- **B.5 UI:** harte Anforderung Übersichtlichkeit (einklappbare Anlagen-Blöcke, Baum-Overlay, Filter).
- **B.6 Gating:** ausschließlich über die aufeinander aufbauende Materialkette; Invariante beachten.
- **C Auswahl:** 3 Strukturen — Dyson-Schwarm, Temporaler Verstärker (+30 % lokal, nur einer),
  Versorgungs-Nexus (nur an Sagittarius A\*).
- **C Phasen:** genau 4 je Struktur, kein wiederholtes Material über Phasen, Montagezeit ja.
- **C Sichtbarkeit:** im System + in Galaxie-Systeminfo.
- **C Freischaltung:** spät, immer nur eine zur Zeit; Reihenfolge Dyson → Temporaler Verstärker → Versorgungs-Nexus.
- **E Offline:** 10 %, Deckel 1 h, per Upgrade erhöhbar.
- **Frage 3 (endlich?):** ja, strikt endlich.
- **Frage 4 (Bauplatz-Limit?):** keins — Übersicht trägt die UI (B.5).
- **Frage 5 (Boni-Skala?):** %-Boni starten bei ~15 % (galaxisweit); nicht alle Effekte sind %.
- **Endspiel:** praktisch endlos, kein hartes Ende.

## Megastruktur-Reihe (final)
1. **Dyson-Schwarm** — +15 % Durchsatz aller Anlagen galaxisweit.
2. **Temporaler Verstärker** — +30 % Tempo im Trägersystem (nur einer erlaubt).
3. **Versorgungs-Nexus** — galaxisweites Zentrallager, Bau nur im Orbit um Sagittarius A\*.

Je 4 Bauphasen, jede Phase ein anderes Endprodukt-Set, Montagezeit je Phase.

## Konzept abgeschlossen
Damit ist das Designkonzept für B, C und E vollständig. Nächster Schritt wäre die **Umsetzungs-
reihenfolge** in `astromine-v2.html` (Vorschlag: B-Materialebenen + Schmelze zuerst, dann Fabrik/Werft,
dann C, zuletzt E) — auf dein Signal.
