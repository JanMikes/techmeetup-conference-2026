# Building Modern APIs in PHP (2026 Edition)

TechMeetup Conference, Fri 20 Nov 2026. Jan Mikeš, [janmikes.cz](https://janmikes.cz).
About 40 minutes, 80 slides. Everything comes from [MySpeedPuzzling](https://github.com/MySpeedPuzzling/myspeedpuzzling.com) (MIT).

Built to the spec in [DECK-RECIPE.md](https://github.com/JanMikes/techmeetup-43-clean-context/blob/main/DECK-RECIPE.md): plain HTML/CSS/JS, no build, no network.

## Presenting

Open `index.html`. It works offline, from a USB stick.

| Key | |
|---|---|
| `→` `space` click swipe | next **step**, then the next slide |
| `←` | previous step / slide |
| `R` | replay the Claude Code animation (cold open) |
| `N` | speaker notes |
| `O` | jump to slide (act labels, `CUT IF LONG` flags) |
| `T` | light / dark theme |
| `F` | fullscreen |
| `?` | help |

- **Steps.** Elements with class `step` appear one per `→`.
- **Autoplay.** A slide with `data-autoplay` plays its steps by itself (`data-delay` in ms; `.type` types its `data-text`). `→` during playback jumps to the end.
- **Before the talk:**
  - Pick the theme in the venue.
  - Run `caffeinate -d`.
  - Export the PDF backup:

```bash
python3 -m http.server 8899 &
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --no-pdf-header-footer --virtual-time-budget=6000 \
  --print-to-pdf=slides-backup.pdf http://localhost:8899/index.html
```

## Editing

- **Slides:** one `<section class="slide">` per slide, in order. Speaker notes go in `<aside class="notes-src">`.
- **Colours:** only in the two token blocks at the top of `style.css`.
- **Assets:** images are in `assets/memes/` (generated in ComfyUI, no text baked in; captions are HTML) and `assets/img/`. A missing image falls back to the slide title.
- **Overflow check:** serve the repo, then open `tools/check-overflow.html`. It checks every slide at 1920×1080 and 390×844.

## Working material
- `STRUCTURE.md`: the slide plan.
- `OUTLINE.md`, `content/*.md`: verified facts and stories.
- `benchmark/`: worker vs. classic.
- `recording/`: the real Claude Code session behind the cold open.
