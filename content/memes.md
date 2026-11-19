# Memes (generated in ComfyUI, captions added afterwards)

**Rule:** generate the **image without text**, then add the caption with ImageMagick. Diffusion models mangle text. A clean overlay in Impact-style font, white with a black outline, looks like a real meme.
**Originality:** these are original scenes, *inspired by* meme formats, not copies of specific copyrighted templates. They're safe to put on a recorded talk.

```bash
# caption overlay (top + bottom)
magick in.png -gravity north -font Impact -pointsize 72 -fill white -stroke black -strokewidth 4 \
  -annotate +0+30 "TOP TEXT" -gravity south -annotate +0+30 "BOTTOM TEXT" out.png
```

## 1. 02:29: "deploy and go to sleep" (war story 1, intro beat)
- **Prompt:** "a software developer sleeping peacefully and smiling in bed at night, laptop on the nightstand showing a green 'deployed' checkmark, through the window behind him a server room glowing orange with flames and smoke, cinematic photo, dark blue night lighting, high detail"
- **Caption:**
  - Top: `02:29 — WORKER MODE: ON. GOOD NIGHT.`
  - Bottom: `WHAT COULD POSSIBLY GO WRONG?`
- **Variant:** a 3-panel strip.
  1. 02:29, merging, a confident face.
  2. 03:35, asleep.
  3. 07:00, a phone with 40 notifications lighting up a horrified face in the dark.

## 2. "One sign-on. For everyone." (war story 1, the punchline)
- **Prompt:** "a large crowd of diverse people in a city square all wearing identical rubber masks of the same smiling bald man, photorealistic, surreal, daylight"
- **Caption:** `PERFECT SINGLE SIGN-ON` / `ONE SIGN-ON. FOR EVERYONE.`

## 3. CineStar karma (prologue of war story 1)
- **A 2-panel image.**
  - Left prompt: "a developer at a desk laughing hard and pointing at a phone, cozy room, November evening".
  - Right prompt: "the same developer in the same room, now pale and horrified, staring at his laptop at night, New Year's fireworks outside the window".
- **Caption:**
  - Left: `NOV 2025: "HOW CAN THAT EVEN HAPPEN?"`
  - Right: `31 DEC 2025:`

## 4. Classic PHP vs. worker mode (benchmark slide)
- **Prompt:** "a person solving a jigsaw puzzle, after placing each single piece they sweep the entire puzzle back into the box and start over, exhausted, comic style illustration"
- **Caption:** `CLASSIC PHP` / `EVERY. SINGLE. REQUEST.`

## 5. The wet-ink signature (war story 2, Auth0 exit)
- **Prompt:** "a modern software developer in a hoodie signing a long parchment scroll with a feather quill and red wax seal by candlelight, laptop next to him, renaissance painting style, dramatic chiaroscuro"
- **Caption:** `2026: GETTING MY OWN USERS' PASSWORDS BACK` / `"WET-INK EXECUTIVE SIGNATURE REQUIRED"`

## 6. N+1 (read model slide)
- **Prompt:** "a person on a long walk carrying a single jigsaw puzzle piece across a huge empty warehouse toward a tiny table, thousands of footprints back and forth on the floor, wide shot, minimalist"
- **Caption:** `DOCTRINE, LOADING 2,327 RESULTS` / `9,210 TRIPS TO THE BOX`

## 7. "PHP is dead" (closing)
- **Prompt:** "an elephant (PHP mascot style, blue) in a hospital bed wearing sunglasses, doing a thumbs up, heart monitor showing a healthy beat, flowers, cartoon illustration"
- **Caption:** `PHP IN 2026` / `"DEAD" SINCE 2008. 23 MS P50.`

## Production notes
- **ComfyUI:** start ComfyUI (the MCP expects it at `127.0.0.1:8000`), then generate the images with `generate_image`, 1344×768 (16:9), 3–4 seeds each, and pick the best.
- **Output:** save into `assets/memes/` in this repo (raw image and captioned image).
- **Faces:** generated people only. No real persons, no CineStar logo. A headline screenshot is a separate slide, with the source cited.

## 8. The inbox, New Year's morning 2026 (war story 1: "how I found out")
- **This is not a ComfyUI image.** Build it as an **HTML mock** of a **generic** mail client, Mailpit-like (a nod to the dev tooling), with no Gmail/Google logo or branding. Screenshot it with headless Chrome into `assets/inbox-1jan.webp`. The text is crisp and editable.
- **About 50 rows, 1 Jan 2026, 06:12 → 09:03,** bold (unread). All senders are fake first names (no real users).
- Mix subjects in Czech, German, English and Polish (it's an international community):
  - `URGENT: I'm logged in as someone else`
  - `CRITICAL!!! these are not my results`
  - `BUG – who is Petr and why am I him?`
  - `Šťastný nový rok… proč jsem Martina?`
  - `DRINGEND: falsches Konto`
  - `Happy New Year! Also, I'm a different person now`
  - `URGENT URGENT URGENT`
  - `My times are gone (but I have 400 new ones??)`
  - `Is this a New Year's joke?`
  - `PILNE: to nie jest moje konto`
  - `I just added a time to someone else's profile, sorry`
  - `BUG: my avatar is a cat now. I don't have a cat.`
- **Variants:**
  - A static screenshot.
  - Or an animated slide: the unread counter ticks up 1 → 50 while Jan narrates.
