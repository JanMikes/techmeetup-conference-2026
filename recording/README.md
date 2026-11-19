# Intro recording: "make me a million dollar endpoint" (a real Claude Code session)

> **Done this way (19 Nov 2026):**
> - The session ran **headless**: `claude -p "<meme prompt>" --append-system-prompt-file setup-prompt.md --output-format stream-json --verbose`.
> - The full structured log is in `session.jsonl`: every message and tool call, which is what we animate in the deck as a typewriter Claude Code UI.
> - The **PR** is the second artifact. Its code goes on slides (filtering, validation, serialization, pagination).
> - The asciinema route below is no longer needed. It stays only as a fallback.

## The bit
1. **The audience sees** a real Claude Code terminal and this prompt typed live:

   > create me puzzle endpoint that will make me a million dollar, with serializers, validators, pagination, filtering, documentation

2. **They do not see the setup prompt.** It is loaded invisibly with `--append-system-prompt-file recording/setup-prompt.md`, so the session looks like Claude understood a meme-prompt perfectly.
3. **Claude really builds it:**
   - reads the existing code
   - writes a `/v1/puzzles/{puzzleId}/leaderboard` resource, provider, validation, OpenAPI docs and tests
   - runs them
   - opens a draft PR
4. **The punchline is Claude's last line:** "Estimated revenue: $0.00. You asked for a million-dollar endpoint, not a business model."
5. **"Show what it created"** (cut to it right after the session):
   - the PR page
   - the endpoint in the generated OpenAPI/Swagger docs
   - a `curl` that returns real leaderboard JSON
   - a `curl` with `limit=1000` that returns a **422**: "it even says no to me."
6. **Then the title slide:** "Hi, I'm Jan. Everything you just saw runs on a real production app. Let me show you why that took 6 minutes and not 6 weeks."

**Why this endpoint:** the read model (`GetPuzzleSolvers`) already exists for the website, so Claude only adds the API layer. That is literally the talk's core message ("the API was the easy part"), proven in the first minute. Callback later: "Remember the million-dollar endpoint? It was fast to build because of *this*."

**After the recording:** close the PR unmerged, delete the branch, remove the worktree. It's a demo.
- Option: leave the closed PR public as an easter egg ("PR #NNN, closed, revenue $0").

## Setup (run once, before the take)

The code lives in `~/www/speedpuzzling.cz`. Use a clean checkout so the take never includes your work in progress:

```bash
cd ~/www/speedpuzzling.cz
git status                      # must be clean, or use a separate worktree
git switch main && git pull
docker compose up -d            # tests need the stack running
```

Terminal for the recording:
- iTerm/Ghostty, **dark theme, font 20–22 pt, window ~120×32**.
- Hide the prompt, hostname and anything personal.
- No notifications (Focus mode).
- Make sure **nothing secret is on screen**:
  - no `.env.local`
  - no `compose.override.yml` (it has a real GitHub token)
  - no real PATs (the hidden prompt says to use the `msp_pat_…` placeholder)

## The take

```bash
brew install asciinema          # once

asciinema rec --idle-time-limit 1.5 --cols 120 --rows 32 \
  ~/www/techmeetup-conference-2026/recording/million-dollar.cast \
  -c "claude --append-system-prompt-file ~/www/techmeetup-conference-2026/recording/setup-prompt.md \
             --permission-mode bypassPermissions -n million-dollar"
```

Then type the visible prompt by hand. A typo or two looks authentic. Let it run without interrupting, and exit with `/exit` when the PR link and the revenue line are on screen.

- `bypassPermissions`: no permission dialogs breaking the flow. It's acceptable here because the task is scoped to one branch and one draft PR.
- `--idle-time-limit 1.5` compresses waiting for tests and the model to at most 1.5 s per pause.
- **Do a dry run first**, then throw it away: close the PR and delete the branch. Time it and check the output looks good. Record the second take.

## Into the deck

- **Preferred: embed the `.cast` with [asciinema-player](https://github.com/asciinema/asciinema-player).**
  - Vendor the player's JS and CSS **into the deck repo** (no CDN, per DECK-RECIPE).
  - It shows real text, sharp at any resolution, readable on phones, and the file is a few hundred kB.
  - Play at `speed: 3–4`. Add `markers` to pause on the prompt and on the final punchline.
- **Fallback:** a `.cast` → MP4 via [`agg`](https://github.com/asciinema/agg) → `ffmpeg`, for the PDF backup and social media.
- **Target length on stage: 60–90 s.** If the raw session is long, trim the middle (reading files) with `asciinema cut`/edit, or rely on `speed`.

## Cleanup after the final take

```bash
gh pr close <NNN> --repo MySpeedPuzzling/myspeedpuzzling.com --delete-branch   # or keep it closed as an easter egg
git switch main && git branch -D demo/million-dollar-leaderboard
```

## Risks
- **The model behaves differently on the day.** That's why we record; we don't do this live. Keep the cast from the good take.
- **Claude mentions "as instructed…"** or otherwise leaks the setup. Re-record; the prompt forbids it.
- **Tests are slow** (Docker, DB). The idle limit hides it. If a test fails and Claude fixes it, that is actually *good* footage: "even the AI has to fix its tests."
