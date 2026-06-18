# Changelog

Alle nennenswerten Änderungen an Astromine. Format orientiert sich an
[Keep a Changelog](https://keepachangelog.com/), Versionierung nach
[Semantic Versioning](https://semver.org/lang/de/).

Wichtig: Der `localStorage`-Save-Key bleibt stabil (`galaktischer-kartograf-spiel-v1`),
damit bestehende Spielstände erhalten bleiben.

## [Unreleased]

### Geplant
- Vollständige Übersetzung EN/DE mit Sprachumschalter und Einstellungsfenster (Standard: Englisch)
- Aufräumen der Code-Kommentare

## [2.0.1] - 2026-06-18

### Behoben
- **Kristall-Sperre in Sol:** Der Sol-Asteroidengürtel (Tier 3) führt jetzt ein kleines
  Kristallvorkommen (1000 Einheiten), sodass Werft/Expansion nicht mehr ausschließlich über
  die tiefe Raffinerie-Kette erreichbar sind. Größere Mengen weiterhin nur per Raffinerie.
- **Methaneis-Soft-Lock:** Der Sondenausbau Stufe 4→5 verlangt kein Methaneis mehr
  (Nickel/Helium-3/Silikat statt Nickel/Helium-3/Methaneis). Methaneis wird erst ab
  Stufe 5→6 fällig — also erst, nachdem die erste Methaneis-Quelle (Titan, Tier 5)
  erreichbar ist. Gleiche Korrektur für die Förderer-Ausbaukosten.

## [2.0.0] - 2026-06-18

### Hinzugefügt
- Erste versionierte Fassung (Git-Setup, Lizenz, Projektstruktur) als Basis für die
  Veröffentlichung über GitHub Pages und itch.io.
- Spielstand der dichten Single-File-Fassung (Galaxie mit 2000 Systemen, Bergbau,
  Förderer, Erkundungssonde, Handelsstationen/Flotte, Raffinerie, Veredelung,
  Werft/Module, Megastrukturen).
