# CLAUDE.md

Talk deck: **"Building Modern APIs in PHP (2026 Edition)"**, Jan Mikeš, TechMeetup Conference, 20 Nov 2026. It's a 40-minute talk, Q&A not included, in English.
It is published as a static website. Everything shown comes from MySpeedPuzzling (`~/www/speedpuzzling.cz`, open source).

## Commit discipline (always)

- **Commit continuously, not at the end.** After every finished change (a new or edited slide group, a content file, an image batch, a tooling fix), commit before moving on. Never leave a working session with uncommitted work.
- **One logical change per commit.** For example: "Deck: add domain-exception slides", "Deck: reorder act 1 for story flow", "Memes: regenerate classic-php". Don't mix unrelated changes.
- **Message style:** an imperative subject (≤ 72 chars) with an area prefix (`Deck:`, `Style:`, `Content:`, `Memes:`, `Benchmark:`, `Recording:`, `Tools:`, `Docs:`). Add a body when the *why* isn't obvious, plus the attribution line required by the session.
- Commit directly to `main`. This is a solo deck repo.
- **Before committing deck changes:**
  - open `tools/check-overflow.html` (served over http): desktop must say `OK`, and phone may only list inner `.term` scrolls (`innerH…`, never `v>0` or `page>0`);
  - keep `STRUCTURE.md` in sync when slides are added, removed or reordered.
- **Never commit secrets or private data:**
  - `benchmark/.token` (ignored)
  - anything from MSP's `compose.override.yml` or `.env*`
  - real PATs (use the `msp_pat_…` placeholder)
  - `INTERNAL_API_TOKEN`
  - the user's email
  
  Scan new logs and recordings before adding them.
- Don't commit temporary files: `_shot.html` and screenshots belong in the session scratchpad.

## Deck rules (DECK-RECIPE)

- Plain HTML/CSS/JS, no build, no CDN. Slides live in `index.html` as `<section class="slide">`.
  - `.act` sets the jump-index label.
  - `.notes-src` holds the speaker notes.
  - `.step` marks click reveals; `.step.with-prev` appears on the same click as the step before it.
- Colour tokens are defined only in `:root` and `body.light` in `style.css`.
- Every new layout needs a mobile override `@media (pointer: coarse), (max-width: 860px)`. Check it at 390 px.
- Use at most 3 `<mark>` per slide.
- Code blocks get a language class for syntax highlighting: `<pre class="term php">` or `<pre class="term sql">` (deck.js tokenizes them at load). Shell, HTTP output and logs stay plain. Hand-made `<mark>`/`.k`/`.c` spans win over the automatic colours.
- Code on slides must be **real code** from MSP (or Fantasy Academy), with the file path in `.file`. Any trimming is said in the notes. Where the details don't matter, replace them with a short PHP comment that says what's there, e.g. `new CollectionResponse(/* id, name, description, visibility */)`, rather than a bare `…`. SQL may be shortened the same way (`SELECT /* the columns */ FROM …`). Facts and numbers must be verified against the repo, git or production data.
- The story flow is documented in `STRUCTURE.md` ("Iteration 5" table). Each section may only rely on what an earlier section explained.

## Useful commands

```bash
python3 -m http.server 8899      # then http://localhost:8899 (deck) and /tools/check-overflow.html
```
