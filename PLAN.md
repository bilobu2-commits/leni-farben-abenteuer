# Leni's Farben-Abenteuer – Projektplan

## Kernkonzept
Leni (Spielfigur, 2D "Papierfigur") läuft frei über eine begrenzte, weiße Map im
Paper-Mario-Stil. Auf der Map wandern 5 unbemalte (weiße) Kreaturen zufällig
umher. Leni läuft zu einem Malkasten am Kartenrand, lädt Farbe auf ihren
Pinsel, läuft zu einer Kreatur, berührt sie → Kreatur wird bemalt, freut sich
und läuft zu ihrem Zuhause am Kartenrand. Level ist geschafft, wenn alle
Kreaturen zuhause sind. Zielgerät: PC/Laptop mit Maus. Später: mehrere Farben,
mehrfarbige Kreaturen, mehrere Level.

## Technologie-Stack
- **Phaser 3** (Game-Framework) + **TypeScript** + **Vite** (Dev-Server/Build)
- Läuft im Browser → ich kann während der Entwicklung einen lokalen Dev-Server
  starten, Screenshots machen und Klicks/Interaktionen live testen, ohne dass
  du manuell gegenprüfen musst. Das macht iteratives Arbeiten sehr schnell.
- Später bei Bedarf: Verpackung als installierbare App via Capacitor/Tauri
  (aus dem Web-Build), falls das Spiel doch auf einem Tablet laufen soll.

## Zentrale Architektur-Idee: Einfärben per Tint statt separater Sprites
Statt für jede Kreatur zwei fertige Bilder (weiß + blau) zu erzeugen, nutzen
wir **Phaser's `setTint(color)`**: Ein Sprite wird als helles/weißes Umriss-
Bild geliefert, und die Engine färbt es zur Laufzeit in jede beliebige Farbe.
Vorteile:
- KI muss pro Kreatur nur **ein** Sprite erzeugen (weiß/hell, transparenter
  Hintergrund) – kein Alignment-Problem zwischen "weißer" und "bunter"
  Version.
- Farbwechsel ist eine Zeile Code, beliebig erweiterbar (jede Farbe möglich).
- Für **mehrfarbige Kreaturen** (spätere Levels): Kreatur wird aus mehreren
  Sprite-Teilen zusammengesetzt (z.B. Körper, Flügel, Punkte als eigene
  GameObjects), jeder Teil bekommt sein eigenes Tint und muss einzeln
  getroffen werden. Gleiche Technik, nur mehr Teile pro Kreatur.

## Steuerung (Maus, für 4-Jährige optimiert)
- **Klick-to-move**: Leni läuft zur angeklickten Position (keine Tastatur-
  Präzision nötig). Kein Doppelklick, kein Drag nötig.
- **Malen passiert automatisch bei Kontakt**: Wenn Leni mit geladenem Pinsel
  eine Kreatur berührt, wird sie bemalt – kein extra Klick/Knopf nötig.
  Das hält die Interaktion einfach genug für ein Kind in dem Alter.
- Malkasten funktioniert genauso: hinklicken, Leni läuft hin, Pinsel wird
  automatisch bei Kontakt aufgefüllt.
- (Spätere Option, falls gewünscht: WASD/Pfeiltasten als Alternative –
  Klick-to-move bleibt aber die Standard-Empfehlung für dieses Alter.)

## Sprite-Produktion (KI-generiert)
1. **Stil festlegen**: flache, papierartige Illustration, dicke klare
   Konturen, wenig Detail (Kind-freundlich, aus der Distanz erkennbar).
   Empfehlenswerte Tools: Recraft.ai oder Adobe Firefly (gut für konsistente
   "Flat Vector / Sticker"-Stile mit transparentem Hintergrund), alternativ
   Midjourney + manuelles Freistellen.
2. **Ein Style-Prompt / Referenzbild** festlegen und für alle Kreaturen +
   Leni wiederverwenden, damit alles zusammenpasst.
3. **Export-Vorgaben**: PNG, transparenter Hintergrund, quadratisch
   (z.B. 512×512), Motiv in hellem/weißem Ton (fürs Tinten geeignet),
   zentriert mit etwas Rand.
4. Für später geplante mehrteilige Kreaturen: die Einzelteile (Kopf, Körper,
   Flecken, Flügel …) als separate Dateien mit gleichem Ursprung/Pivot
   anfragen, damit sie sich in Phaser exakt übereinanderlegen lassen.
5. Map/Hintergrund, Malkasten, Zuhause-Symbole: gleicher Stil, ebenfalls
   als transparente PNGs oder direkt als fertiger Hintergrund.

## Iterativer Fahrplan

**M0 – Projekt-Setup**
Vite + TypeScript + Phaser Grundgerüst, leere Szene, Git-Commit.

**M1 – Bewegung & Map (Platzhalter-Grafiken)**
Statische Map mit Grenzen, Leni als einfaches Rechteck/Kreis, Klick-to-move
mit sauberem Pathing innerhalb der Kartengrenzen.

**M2 – Malkasten & Pinsel-Status**
Malkasten-Objekt am Rand, Leni hat internen Zustand "Pinsel leer/blau",
visuelles Feedback (z.B. Farbklecks-Icon über Leni), Auffüll-Logik bei
Kontakt.

**M3 – Erste Kreatur: KI-Bewegung, Bemalen, Nachhause-Laufen**
Eine Platzhalter-Kreatur mit zufälliger Wander-Bewegung innerhalb der Map,
Kollisionserkennung mit Leni, Zustandsmaschine
(`unbemalt → bemalt → läuft_heim → zuhause`), Tint-Wechsel bei Treffer.

**M4 – Alle 5 Kreaturen + Levelabschluss**
5 Kreaturen gleichzeitig, Fortschrittsanzeige (z.B. 5 kleine Icons),
Erkennung "alle zuhause" → Erfolgsscreen/Sound.

**M5 – Echte Sprites einbauen**
Platzhalter durch KI-generierte Sprites ersetzen (Leni, 5 Kreaturen,
Malkasten, Zuhause-Marker, Hintergrund/Map).

**M6 – Polish**
Soundeffekte (Farbklecks, fröhliches Kreaturen-Geräusch, Schritte),
kleine Animationen (Lauf-Zyklus, Freude-Hüpfer), Partikeleffekt beim Bemalen,
sanfte Übergänge.

**M7 – Ausblick (spätere Levels)**
Mehrere Farben im Malkasten (Farbauswahl per Klick auf Farbeimer),
mehrfarbige Kreaturen (mehrteilige Sprites), weitere Level/Maps,
Levelauswahl-Screen, optional Tablet-Export.

## Vorgeschlagene Ordnerstruktur
```
leni-farben-abenteuer/
  src/
    main.ts
    scenes/
      GameScene.ts
      PreloadScene.ts
    entities/
      Player.ts
      Creature.ts
      PaintBox.ts
    config/
      levels.ts        # Level-Definitionen: Kreaturen, Farben, Positionen
  assets/
    sprites/
    audio/
  PLAN.md
```

## Offene Punkte für später
- Wie viele Farben in Level 1 wirklich am Anfang sichtbar (nur blau) vs.
  vorbereitete Datenstruktur für mehrere Farben ab M2.
- Soundeffekte: selbst aufnehmen (z.B. Lenis eigene Stimme) oder
  KI-generiert/freie Assets.
- Ob am Ende ein Distributionsweg gebraucht wird (nur lokal starten via
  `npm run dev`, oder als Datei/App für Lenis Gerät verpacken).
