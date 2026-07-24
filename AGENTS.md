# AGENTS.md — Kontext für zukünftige Sessions

Dieses Dokument fasst zusammen, was in "Leni's Farben-Abenteuer" bereits gebaut wurde
und wie das Projekt aufgebaut ist. Gedacht als kompakter Kontext-Einstieg für eine
KI-Session, ohne den kompletten Gesprächsverlauf durchgehen zu müssen. Der ursprüngliche
Plan mit der Ideenskizze steht in [PLAN.md](PLAN.md) — dieses Dokument beschreibt den
**aktuellen, tatsächlich gebauten Stand**.

## Kurzfassung des Spiels

Leni (4-jährige Zielgruppe) läuft mit der Maus über eine Papier-Stil-Karte, holt sich am
Malkasten Farbe und bemalt weiße, herumwandernde Monster per Berührung. Bemalte Monster
laufen glücklich zu ihrem Zuhause in der oberen rechten Ecke und verschwinden dort. Level 1
ist fertig spielbar: 5 Monster, 1 Farbtopf (Blau).

## Tech-Stack

- **Phaser 3** (Arcade Physics) + **TypeScript** + **Vite** — Web-basiert, läuft im Browser
  via `npm run dev` auf Port 5173.
- Keine weiteren Frameworks. Kein Backend.
- `npm run build` für einen Produktions-Build (tsc + vite build).

### Bekannte Umgebungs-Eigenheit (Windows, dieser Rechner)

Node.js wurde erst während der Entwicklung per `winget install OpenJS.NodeJS.LTS`
installiert. Falls `node`/`npm` in einer neuen Shell nicht gefunden werden, PATH aus der
Registry neu laden:

```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path','User')
```

## Ordnerstruktur

```
leni-farben-abenteuer/
  index.html            # HTML-Shell: #hud (Titel + Fortschritt) außerhalb, #game-Div für Phaser
  src/
    main.ts             # Phaser-Game-Config, startet PreloadScene → GameScene
    scenes/
      PreloadScene.ts    # lädt alle Bild- und Audio-Assets
      GameScene.ts       # gesamte Spiellogik, Level-Aufbau, Sieg-Erkennung
    entities/
      Player.ts          # Leni: Klick-to-move, Pinsel-Zustand, Bodenschatten
      Creature.ts         # Monster: Zustandsmaschine, Wander-KI, Heimlauf-Steuerung
      PaintBox.ts         # Farbtopf: statisch, per Tint eingefärbt
      GroundShadow.ts     # kleine Hilfsfunktion für die Boden-Schatten-Ellipsen
    ui/
      Hud.ts             # DOM-basierte Fortschrittspunkte (außerhalb des Canvas)
    config/
      levels.ts          # LEVEL_1-Datenstruktur (Karte, Farbtöpfe, Monster-Startpositionen/-Zuhause)
  assets/                # von Vite servierte, spielfertige Dateien (publicDir)
    sprites/             leni.png, monster.png, paintpot.png (freigestellt, transparent)
    backgrounds/         canvas.jpg (Papier-Hintergrund, unverändert)
    audio/               anmalsound.mp3, heimkommen1.mp3, heimkommen2.mp3
  images/                # rohe, unbearbeitete Quell-JPEGs von der Nutzerin (nicht von Vite serviert)
  sound/                 # rohe, unbearbeitete Quell-MP3s (nicht von Vite serviert)
  scripts/
    cutout.mjs           # Freistell-Tool: JPEG mit Schachbrett-Hintergrund → transparentes PNG
```

**Wichtig:** `vite.config.ts` setzt `publicDir: "assets"`. Nur Dateien unter `assets/`
sind zur Laufzeit erreichbar (z.B. `assets/sprites/leni.png` → `/sprites/leni.png`).
Rohdateien aus `images/` und `sound/` müssen erst nach `assets/` verarbeitet/kopiert werden.

## Asset-Pipeline (wichtig für neue Sprites)

Die von der Nutzerin gelieferten JPEGs haben **kein echtes Alpha** — JPEG kann das nicht.
Der sichtbare Schachbrett-Hintergrund ist eingebrannt. `scripts/cutout.mjs` entfernt ihn:

```bash
node scripts/cutout.mjs images/Neu.jpeg assets/sprites/neu.png [brightnessMin]
```

Funktionsweise: Flood-Fill von allen vier Bildrändern aus über alle "hellen, entsättigten"
Pixel (Default-Schwelle: Helligkeit > 200, Sättigung < 18), danach Zuschnitt auf die
Opaque-Bounding-Box + 6px Rand. Reines JS (`jpeg-js` + `pngjs`, keine nativen Build-Tools
nötig). Falls Reste vom Schachbrettmuster übrig bleiben (sichtbar als isolierte helle
Flecken), war die Helligkeits-Schwelle zu hoch angesetzt — mit dem dritten CLI-Argument
niedriger ansetzen (z.B. `180`).

**Zentrale Architektur-Entscheidung:** Alle Figuren werden als **ein weißes/helles Sprite**
geliefert und zur Laufzeit per Phaser `setTint(farbe)` eingefärbt — nicht als fertig bunte
Bilder. Das gilt für Monster (weiß → bemalt) und Farbtöpfe (weiß → Topf-Farbe). Für später
geplante mehrfarbige Monster: Sprite in mehrere Teile (Körper, Flecken, Flügel …) zerlegen,
jeder Teil eigenes GameObject mit eigenem Tint.

## Gameplay-Architektur

### Zustandsmaschine der Monster (`Creature.creatureState`)

`unbemalt → bemalt → laeuftHeim → zuhause` (dann `disappear()`, Sprite + Schatten
verblassen und werden zerstört, `arrived-home`-Event wird vorher emittiert).

- **unbemalt**: wandert zufällig (alle 1,2–2,6s neue Richtung), prallt an Kartenrand und am
  Malkasten ab (`collideWorldBounds` + `setBounce(1,1)`, plus expliziter Collider gegen
  jeden Farbtopf, damit Monster nicht hineinlaufen können).
- **bemalt → laeuftHeim**: `walkHome()` schaltet Weltgrenzen-Kollision **ab**
  (`setCollideWorldBounds(false)`) und steuert danach **jeden Frame neu** auf die
  Zuhause-Koordinate zu (nicht nur einmalig!). Wichtig: eine einmalig gesetzte Geschwindigkeit
  plus Wandkollision führte dazu, dass Monster mit Zuhause nahe, aber nicht exakt auf dem
  Kartenrand am Rand abprallten und ihr Ziel nie erreichten — das war ein echter Bug, der erst
  mit den größeren, echten Sprites sichtbar wurde (bei den kleinen Platzhaltern nicht).
- **zuhause**: Physik-Body deaktiviert, kleiner Hüpf-Tween, dann Fade-out + Destroy.

### Malen / Pinsel

- `Player.brushColor: number | null` — `null` = leerer Pinsel.
- Überlappung Leni ↔ Farbtopf füllt den Pinsel (`player.setBrushColor(farbe)`), passiert
  **jeden Frame** solange Leni im Topf steht (kein einmaliger Trigger) — steht sie im Topf,
  bleibt der Pinsel dauerhaft voll.
- Überlappung Leni ↔ unbemaltes Monster mit vollem Pinsel: `creature.paint(farbe)`,
  Anmalsound (`seek: 0.4`, siehe unten), danach `player.clearBrushColor()` — Pinsel ist leer,
  bis Leni erneut zum Topf läuft.
- Mehrere Farbtöpfe sind vorbereitet: `LEVEL_1.paintBoxes` ist ein **Array**
  (`{x, y, color}[]`), `GameScene` erzeugt beliebig viele `PaintBox`-Instanzen und registriert
  Überlappung/Collider für alle auf einmal. Für Level 2 reicht ein zweiter Eintrag mit
  anderer Farbe in `levels.ts` — der Rest funktioniert automatisch pro Topf.

### Steuerung

Klick-to-move (Maus): Klick irgendwo auf die Karte → Leni läuft dorthin
(`Player.moveTo(x,y)`, Geschwindigkeit 260px/s, stoppt bei Annäherung <6px). Malen passiert
automatisch bei Berührung, kein extra Knopf — bewusst so einfach wie möglich für eine
4-Jährige.

### Sieg-Erkennung

`GameScene.homeCount` wird bei jedem `arrived-home`-Event hochgezählt (via
`creature.on("arrived-home", ...)`). Bei `homeCount === Anzahl Monster` erscheint ein
Overlay ("Alle Freunde sind zuhause!") mit einem **"Nochmal spielen"**-Button, der
`this.scene.restart()` aufruft.

**Wichtige Phaser-Falle:** `scene.restart()` erzeugt **keine neue Scene-Instanz** — alle
Felder mit Default-Werten (`homeCount`, `creatures`-Array, `levelComplete`-Flag) müssen in
`create()` **explizit zurückgesetzt** werden, sonst bleiben sie über den Neustart hinweg
stehen.

**Zweite Phaser-Falle:** Ein interaktives Kind-Element *innerhalb* eines
`Phaser.GameObjects.Container` wird vom Klick-Hit-Test **nicht** erkannt. Der Container
selbst braucht `setInteractive()` mit einer explizit **zentrierten** `hitArea`
(`new Phaser.Geom.Rectangle(-width/2, -height/2, width, height)`), sonst wird der Klick
nicht erkannt oder landet am falschen Punkt (Default-Hitarea ist nicht auf den
Container-Ursprung zentriert).

### HUD (Titel + Fortschrittspunkte)

Bewusst **außerhalb** des Phaser-Canvas als normales HTML/CSS im `#hud`-Div (siehe
`index.html` + `src/ui/Hud.ts`), nicht als Phaser-GameObjects. `setupProgressDots(anzahl)`
erzeugt die Punkte neu (wichtig: auch bei `scene.restart()` erneut aufrufen, da DOM-Elemente
einen Scene-Neustart überleben und sonst nicht zurückgesetzt würden).
`fillProgressDot(index, farbe)` färbt einen Punkt ein.

Der Sieg-Screen ("Alle Freunde sind zuhause!" + Neustart-Button) bleibt bewusst **innerhalb**
des Canvas (Phaser-Overlay über der Spielwelt) — nur Titel/Score wurden explizit
herausgezogen.

### Sound

Geladen in `PreloadScene.preload()` über `this.load.audio(...)`. Abgespielt über
`this.sound.play(key, config)` in `GameScene`:
- **Anmalsound** beim Bemalen eines Monsters — `{ seek: 0.4 }`, weil die MP3 ca. 400ms
  Stille am Anfang hat (Datei ist ~1,56s lang, Seek lässt genug übrig).
- **Heimkommen-Sound** bei Ankunft zuhause — zufällig zwischen zwei Varianten
  (`Phaser.Math.Between(0,1)`).

### Bodenschatten (3D-Wirkung, Paper-Mario-Stil)

`GroundShadow.ts` erzeugt eine flache, halbtransparente schwarze Ellipse, die **vor** dem
Sprite im Display-Tree eingefügt wird (also dahinter gerendert). Jede Figur (Leni, Monster,
Farbtopf) bekommt eine, positioniert an ihren "Füßen". Bei Leni/Monstern wird die Position
jeden Frame in `preUpdate` nachgeführt; beim Monster-Hüpfer beim Heimkommen skaliert der
Schatten bewusst **nicht** mit (verstärkt den Eindruck, dass die Figur kurz abhebt). Schatten
wird zusammen mit der Kreatur zerstört (`disappear()`).

## Bekannte Einschränkungen / offene Punkte

- **Lenis Trefferbox/Ursprung** ist nicht exakt auf ihre gezeichnete Figur zentriert,
  sondern auf die komplette Bounding-Box inklusive des nach rechts ausladenden
  Farbspritzers. Funktioniert einwandfrei, aber Klick-Ziel/Kollision "fühlen" sich minimal
  nach rechts verschoben an. Bei Bedarf: `setOrigin()` anpassen und Body manuell mit
  `setBodySize()`/`setOffset()` auf den tatsächlichen Charakter-Bereich einschränken.
- **Monster-Tint** färbt das komplette Sprite inkl. der beiden farbigen Partyhüte mit ein
  (multiplikatives Tinting) — kein Bug, aber ein optischer Kompromiss der
  Ein-Sprite-plus-Tint-Architektur.
- Noch kein Level 2 (mehrere Farben/Farbtöpfe gleichzeitig, mehrfarbige Monster mit
  mehreren zu bemalenden Teilen) — Architektur ist aber vorbereitet (`paintBoxes`-Array).
- Kein Sound bei Level-Abschluss, keine Loop-/Hintergrundmusik.

## Testing-Hinweis für zukünftige Sessions

Der Dev-Server läuft über das Preview-Tool oft in einem **Hintergrund-Tab**
(`document.hidden = true`), wodurch Chromes `requestAnimationFrame` pausiert und der
Phaser-Game-Loop **nicht von selbst tickt**. Für automatisierte Tests per `preview_eval`
muss der Loop manuell vorangetrieben werden:

```js
let t = performance.now();
for (let i = 0; i < N; i++) { t += 16.6; window.game.loop.step(t); }
```

`window.game` ist nur erreichbar, weil `src/main.ts` es im Dev-Modus (`import.meta.env.DEV`)
absichtlich auf `window` legt. Klicks lassen sich nicht zuverlässig per
`PointerEvent('pointerdown', ...)` simulieren — Phaser reagiert in dieser Umgebung nur
zuverlässig auf klassische `MouseEvent('mousedown', ...)`.

## Umgesetzte Meilensteine (siehe PLAN.md für die ursprüngliche Planung)

- ✅ M0 — Projekt-Setup (Vite + TS + Phaser)
- ✅ M1 — Bewegung (Klick-to-move)
- ✅ M2 — Malkasten & Pinsel-Zustand
- ✅ M3 — Kreaturen-KI (Wandern, Bemalen, Heimlaufen)
- ✅ M4 — Alle 5 Kreaturen, Fortschrittsanzeige, Levelabschluss + Neustart
- ✅ M5 — Echte Sprites (Leni, Monster, Farbtopf, Hintergrund) statt Platzhalter
- ✅ Bonus — Bodenschatten, Sounds, HUD außerhalb des Canvas
- ⬜ M6 — weiteres Polish (Level-Abschluss-Sound, Animationen, Partikel)
- ⬜ M7 — Level 2 (mehrere Farben, mehrfarbige Monster), Levelauswahl
