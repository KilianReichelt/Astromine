# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

## Projekt

**Astromine** (früher „Galaktischer Kartograf") – ein Idle-/Inkrementalspiel über galaktischen
Bergbau, Handel und Veredelung, vollständig in **einer einzigen Datei**: `index.html`.
Reines Vanilla-JavaScript, HTML5-Canvas-2D, **kein Build-Schritt, keine Abhängigkeiten, kein Framework**.
UI-Sprache umschaltbar EN/DE (Standard Englisch), UTF-8, Umlaute/ß überall – siehe globale Anweisungen.

### Projektstruktur
- `index.html` – das komplette Spiel (wird gehostet). **Aktive Arbeitsdatei.**
- `LICENSE`, `README.md`, `CHANGELOG.md` – öffentlich, im Git-Repo.
- `dev/` – Werkzeuge & Test-Build (gitignored, lokal): `stability_test.js`, `astromine-test.html`.
- `docs/` – interne Design-Dokumente (gitignored, lokal).
- `archive/` – alte ZIPs (gitignored).
- Git ist eingerichtet; nur Spiel + Meta sind committed (siehe `.gitignore`). SemVer in `CHANGELOG.md`.

### Ausführen & Testen
- **Starten:** `index.html` im Browser öffnen (Doppelklick oder `start index.html`). Kein Dev-Server.
- **Frischer Stand zum Testen:** im Spiel „Fortschritt zurücksetzen" (Kodex) – das leert auch `SYSCACHE`
  und betritt Sol neu (volle Vorkommen, Sol-Sonde Stufe 1). Alternativ DevTools: `localStorage.clear()`.
- **Syntaxprüfung mit lokalem Node:** Eine portable Node-Installation liegt unter
  `C:\Users\k.reichelt\Downloads\node-v24.15.0-win-x64\node-v24.15.0-win-x64\node.exe`.
  Damit lässt sich der `<script>`-Block ohne Browser auf Syntaxfehler prüfen, z. B. via
  `new Function(scriptInhalt)`. Nach Modell-/Mengenänderungen immer mit Reset gegentesten
  (greifen erst bei frisch generierten Systemen).
- **Stabilitäts-Fuzzer:** `dev/stability_test.js` mockt das Browser-/Canvas-Environment, führt den
  kompletten `<script>`-Block aus und fuzzt Generierung/Rendering/Ticks/Save-Load über alle 2000
  Systeme (alle Sternklassen + Besonderheiten), inkl. korrupter Saves. Aufruf aus dem Projektordner:
  `<node.exe> dev/stability_test.js [datei.html]` (Default `../index.html`; 0 Fehler = stabil).
  Echtes Laufzeit-/Browserverhalten danach weiterhin im Browser gegenprüfen.
- **Testdatei `dev/astromine-test.html`:** Synchronisierte Kopie von `index.html` mit zwei
  Abweichungen: eigener Save-Key (`…-v2-TEST`, lässt den echten Spielstand unberührt) und
  `seedAdvanced()` (im Init), das beim ersten Laden einen weit fortgeschrittenen Stand aufbaut
  (Galaxie offen, große Reichweiten, 7 voll ausgebaute Systeme inkl. Sgr A*, volle Lager, Flotte,
  Förderer, fertiger Dyson-Schwarm in Sol). Nach Änderungen an `index.html` die Testdatei
  neu synchronisieren und KEY + `seedAdvanced` erneut einsetzen.
- **Debugging:** DevTools-Konsole; `SAVE`, `STARS`, `SYSCACHE`, `SYS`, `G()` liegen im `<script>`-IIFE-Scope.

## Architektur

Alles in einem `<script>`-Block, gegliedert durch `/* ===== Abschnitt ===== */`-Kommentare.
Datenfluss: **deterministische Generierung aus Seeds → Caches → Rendering pro Frame → Persistenz nur des Fortschritts.**

### Deterministische, seed-basierte Generierung
- `mulberry32(seed)` ist der einzige PRNG. `pick(rng,arr)` wählt daraus.
- **Galaxie** (`buildGalaxy`, IIFE): `NSTARS=2000` Sterne (`STARS`), Wurzel-Seed `987654321`, je `star.seed`.
  `SOL` (Heimat) und `LMS`-Landmarken (TRAPPIST-1, Sagittarius A* …) an feste Positionen verschoben. `NEBULAE` = Deko.
- **System** (`getSystem(idx)`): erzeugt Planeten/Monde/Kometen/Gürtel/Voyager **lazy** aus `star.seed`,
  cacht in `SYSCACHE` (Map, LRU-Eviction ab 40). Systeme werden NICHT gespeichert (durch Seed reproduzierbar) –
  nur Fortschritt (gescannt, Förderer, Sonde, Vorkommen-Reststand …) liegt im Save.
- **Texturen** (`getTex`): Planetenoberfläche einmalig auf Offscreen-Canvas, an `p.tex` (bei Eviction verworfen).
- **Beschreibungstexte:** `pickDesc(t,sIdx,i)` wählt deterministisch aus `PTYPES.d` + `DESCV[typ]`-Varianten;
  Monde/Kometen haben je mehrere Varianten (rng-gewählt). Heimat/benannte Sol-Körper haben feste Texte.

### Datentabellen (oben, vor der Logik)
`STARCL`, `PTYPES` (+ `DESCV` Textvarianten), `RES` (12 Ressourcen, `RMAP`), `YIELD` (Körpertyp→Ressourcen),
`RAR`/`RARW`, `LMS`, `NEBULAE`, `UP` (Ausbau), `UNI` (einzigartige Module), `ACH` (Erfolge),
`RECIPES` (+ `RECMAP`, Raffinerie). `SOLM`/`SOLMASS`/`SOLMOONMASS` = benannte Sol-Körper + reale Erdmassen.

### Spielmechanik
- `G()` = `SAVE.game` (gesamter veränderlicher Zustand).
- **Erdmasse & Vorkommen:** jeder Körper hat `massN` (M⊕; Sol realistisch, sonst aus Größe/`bodyMass`).
  `attachMine(b,typeId)` setzt `dep`/`depMax`: `total = EARTH_MASS_RES(100000) · massN^MASS_EXP(0.5) · kindMult`
  (Gürtel ×2,5, Komet ×0,8), min 1000/Ressource. **Vorkommen regenerieren NICHT** (`regenSys` ist No-op),
  Reststand wird in `G().dep[bodyId]` persistiert (`saveDep`).
- **Abbau:** `extract(b,power)` verteilt `power` Einheiten via `distributeYield` (Largest-Remainder; **mind. 1
  von jeder vorhandenen Ressource**), gedeckelt vom Vorrat. `mineBody` (manuell, `miningPower()`=4+…) bzw.
  `foeTick` (automatisch alle `FOE_INTERVAL=3` s) rufen es auf. `spawnFloater`/`stepFloaters` zeigen „+N"-Zahlen,
  an die Körper-Weltposition gekoppelt.
- **Förderer:** Rate `foePerSec(L)=L·(L+1)/2` (Dreieckszahl), Höchststufe `FOE_MAX=10`, Kosten ×1,55/Stufe;
  `foeYield(b,L)` = Einheiten/Zyklus je Ressource. `REFLACK` = Mangel-Status (hier nicht relevant).
- **Erkundungssonde** (ersetzt globale Erkundungsstufe, NUR innerhalb eines Systems): Stufe pro System
  `G().probe[idx]`, `bodyReachable(b)` vergleicht `b.tier ≤ probeLevel`. Sol startet auf Stufe 1
  (Erde+Mond frei). Sprung-/Sichtreichweite (Entdeckung NEUER Systeme) bleibt global: `jumpRange()`
  (`JUMPSTEP=75`), `sightRange()`. `probeDistFactor(idx)=1+dSol/700` verteuert ferne Systeme.
- **Per-System-Lager:** `G().store[sysIdx]={resId:Menge}`. Helfer `storeOf`, `activeSys()`, `totalRes(id)`,
  `addRes`, `canAfford(cost,idx)`, `spend(cost,idx)`, `costHTML(cost,idx)`. Bauen zieht aus dem lokalen Lager.
- **Handelsstation** (`G().station[idx]={inter}` = idle Schiffe dort) + **Flotte** `G().fleetN` (Kaufpreis).
  Galaxie wird freigeschaltet, sobald Sol Station + ≥1 interstellares Schiff hat (`checkGalaxyUnlock`).
- **Routen/Schiffe** (Leitregel: **Laden nur an Stationen, Ausladen überall**):
  `transit={stops:[{sys,load,unload}],loop,i,next,cargo,from,to,t,dur,home,cancel}`. `dispatchRouteStops`
  baut die Stopp-Kette (+Rückkehr-Stopp bei `ret`/stationslosem Ziel), `transitTick` führt sie generisch aus
  (Multi-Stop-fähig), `routeLoad/routeUnload/dockShip/cancelRoute`. Schiff dockt nach Lieferung am Ziel an
  (falls Station) bzw. kehrt zurück. Rundrouten (`loop`) wiederholen sich; laden nur Vorhandenes.
- **Raffinerie** (`G().refinery[idx]={lvl,recipes:{rid:{on,acc}}}`): mehrere Rezepte gleichzeitig, je
  pausierbar; `refineryTick` verbraucht aus dem System-Lager, `RECIPES` mit `in/out/unlock`; freigeschaltete
  Rezepte (`G().recipes`) bleiben dauerhaft. `refRecipes` migriert alte Einzelrezept-Saves.

### Rendering, Kamera & Look
- `MODE = "galaxy" | "system"`. `frame(now)` lerpt `cam`→`tgt`, ruft `drawGalaxy()`/`drawSystem()`,
  `stepFloaters`, `updBack/updZoom/updateStatsLive`, alle 0,5 s `refreshOpenPanel`/`updSysOverview`.
- Koordinaten: `w2s(x,y)` / `s2w`. Bahnen `planetPos`/`moonPos`/`probePos`/`stationPos`/`refineryPos`/
  `voyagerPos`/`transitPos`, animiert über `simT` (Rotation bewusst langsam).
- **Galaxie-Hintergrund:** `buildBG()` rendert nur die weichen Verläufe/Nebel auf eine 3000er-Bitmap;
  das **scharfe Sternenfeld `GSTARS` (~22000)** wird pro Frame als Weltpunkte gezeichnet (kein Zoom-Blur).
- **Picking:** `pickAt(sx,sy)` (kinds: star/nebula/sun/planet/probe/station/refinery/voyager), `activate(hit)`.
  Galaxie⇄System über `startWarp`/`stepWarp` (`#warpfx`-Flash).
- **App-Feeling:** PWA-Meta + Inline-Manifest im `<head>`; `goFullscreen`/`toggleFull` (Button `#btnFull`);
  Intro-Modal `#intro` beim allerersten Start (Flag `SAVE.flags.intro`), dessen „Start" ins Vollbild geht.

### Persistenz
- `SAVE` ⇄ `localStorage`, `KEY="galaktischer-kartograf-spiel-v1"` (Key NICHT ändern – sonst Saves weg).
  `freshSave()` = Schema, `loadSave()` merged defensiv + migriert (altes globales `res`→`store[SOL]`,
  `fleetN`, alte Transits/Einzelrezepte verworfen). `persist()` schreibt; `PERSIST=false` wenn localStorage fehlt.
- Wichtige `G()`-Felder: `store, mined, disc, up{jump,sight,mining}, uni, foe, probe, sysDone, dep, station,
  transit[], fleetN, refinery, recipes, firstSol, galaxyOpen, *Hint`. Erfolge in `SAVE.ach`, Scans in `SAVE.p`.

### UI-Overlays (HTML, nicht Canvas)
`#panel` (Infokarte rechts), `#sysov` (Galaxie-Systemliste rechts), `#ups` (Ausbau), `#codex`, `#statswin`
(Statistik), `#cargowin` (Routenplaner/Handelszentrale), `#intro`, `#resbar`, `#toasts`, `#notes`
(dauerhafte Hinweise, nur per ✕ schließbar – `toast(msg,true)` → `note()`), `#floaters`, `#loader`, `#zoomind`.
Aufbau per `innerHTML`-Templating; Listener nach jedem Render neu gebunden. Offene Panels werden NICHT
per Timer neu aufgebaut (Flackern/Klickverlust) – `updateAfford`/`updatePanelLive`/`updUpRes` aktualisieren in place.

## Konventionen
- Dichter, komprimierter Stil: kurze Namen (`p`=planet, `b`=body, `c`=cost, `q`=pos, `s`=screenpos),
  mehrere Anweisungen/Zeile, Pfeilfunktionen. Neuen Code daran angleichen.
- Bezeichner/IDs/Slugs ASCII; **alle sichtbaren Texte deutsch mit echten Umlauten/ß**. Im Quelltext gibt es
  teils `\uXXXX`-Escapes (gewachsen) und teils direkte UTF-8-Umlaute – beides gültig. **Achtung bei Edits:**
  alte Kommentare können `\uXXXX` enthalten; ggf. exakte Schreibweise prüfen.
- Nach Zustandsänderungen `persist()`, `updHUD()`/`updCounters()`, `checkAch()` aufrufen (siehe `buyUp`,
  `buyFoe`, `finishScan`, `dispatchRouteStops`).
- Body-`id`-Schema stabil halten: `"s"+sysIdx+"p"+i` (Planet), `…+"m"+pi+"_"+k` (Mond), `…+"c"+j` (Komet),
  `…+"belt"`, `…+"v1/2"` (Voyager). Diese IDs sind Schlüssel in `SAVE.p`, `G().foe`, `G().dep` usw.

### Multi-Stop & aufgeteilte Lieferungen
Jeder Ausladestopp hat „Alles ausladen" (Default) ODER eine **Mengen-pro-Ressource**-Aufteilung
(`stop.all` bzw. `stop.unload={resId:Menge}`). So lässt sich eine Ladung auf mehrere Ziele verteilen
(z. B. Eisen→B, Nickel→C). `routeUnload` versteht `'all'` und Mengen-Objekte; `dispatchRouteStops`
baut die Specs via `unloadSpec`. UI: pro Stopp `data-sall` (Schalter) + `data-uli`/`data-ulmax` (Mengen),
Manifest-Inputs sind mit `data-man` von den Auslade-Inputs getrennt.

## Offene Punkte / mögliche nächste Schritte
- **Phase 11:** mehr/systemübergreifende Upgrades, mehr Ressourcen/Achievements, erweitertes System-Namenskonzept.
- **Audio:** zurückgestellt; Empfehlung war prozedural via Web Audio (SFX + Ambient, Mute, Autoplay-Gesture).
- **Echtes OS-Fenster:** nur als installierte PWA (über http(s) ausgeliefert); aus der lokalen Datei gibt
  Vollbild den chromelosen Look.
