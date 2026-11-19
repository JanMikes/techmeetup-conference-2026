# Building Modern APIs in PHP (2026 Edition) — working outline

TechMeetup Conference · Fri 20. 11. 2026 · Jan Mikeš · about 40 min
Status: DRAFT v2 for brainstorming.

## Core message (one sentence the audience should be able to repeat)

> **The API was the easy part, because the app was already built right.**
> API Platform is a thin HTTP shell around commands (write) and read models (read).
> The resource is not your entity.

Tone: opinionated and personal. "This is our stack, why I love it, what it cost me." It is not "the one best practice".

## The origin story (backbone of the talk)

| When | What |
|---|---|
| Oct 2023 | MySpeedPuzzling starts as a normal full-stack Symfony app (Twig, forms). No API. |
| Aug 2024 | First API: a hand-rolled "v0" with `?token=` in the query string. Commit message: **"Dummy endpoint"**. |
| Feb 2026 | API Platform arrives, **2 years 4 months after day 1**. |
| Nov 2026 | 38 public operations, OAuth2, PATs, about 90 internal endpoints used by AI agents. One developer. |

The punchline: adding a full API late was cheap because the commands (Messenger) and read queries (SQL) already existed. The web UI, the public API, the internal API and the CLI all call the same commands and queries.

---

## Talk format: research and recommendations

What works for a roughly 40-minute technical talk (Duarte's "what is / what could be" sparkline, Medina's ~10-minute attention rule, and common advice for conference talks):

1. **Cold open, no bio first.** The first 30–60 seconds decide whether people look at their laptops. Start with a story or a question; the bio comes after (20 seconds, as part of the story).
2. **A promise slide.** "You'll leave with 3 things: …". Then keep the promise and callback to it at the end.
3. **Three acts of about 10–12 minutes, each ending with a "reset".** Attention drops at about 10 minutes. A reset can be a joke, a story, an audience guess, a video or a reveal.
4. **One running metaphor or gag and callbacks.** Something you come back to 3–4 times. Callbacks get the biggest laughs and make the talk feel planned.
5. **Make them predict before you reveal.** "Guess how much faster worker mode is" makes everyone care about the number. It is the best trick for benchmarks.
6. **Spread the failure stories through the talk.** A "mistakes" block at the end comes when energy is lowest. Put one story in each act, with a short recap at the end.
7. **Code slides:**
   - At most 10–15 lines.
   - Highlight the 1–3 lines that matter, step by step.
   - Show a before/after when you can.
   - Never a wall of code you then say "don't read".
8. **Use recorded video, not a live demo.** Wi-Fi and AI latency on stage are risky. A 60–90 second sped-up recording with you narrating live is safer.
9. **Pacing:** about one slide per minute on average, so 35–45 slides. Section divider slides help the audience know where they are.
10. **Ending:**
    - Callback to the opening story.
    - 3 takeaways (the same 3 as in the promise).
    - One slide with a QR code and links. Leave it up during Q&A.

### Running metaphor option: "Solve your API like a speed puzzler"

The audience may not know speed puzzling, which makes it a good hook. Speed puzzlers have strategies, and each one maps to a section:

| Puzzling strategy | API equivalent | Act |
|---|---|---|
| Look at the picture on the box first | Design for the screens and scenarios, not tables | 1 |
| Edges first | Contract first: OpenAPI and mocked providers | 1 / 3 |
| Sort the pieces by color | Separate read and write | 1 |
| The timer is running | Performance and worker mode | 2 |
| The missing piece under the sofa | Observability: finding what's wrong | 3 |

Optional cold open:
- Give a small 30-piece puzzle to someone in the front row at the start.
- Reveal their time at the end, as a callback.

Jan to decide: is this too gimmicky, or is it fun?

### The volunteer idea, explained (DROPPED, 19 Nov 2026: not doing it)

1. **Start of the talk.** Before your first slide, hand a small puzzle (about 100 pieces) to a volunteer in the front row and start a visible timer: "Your job: solve this before I finish. My job: build an API before you do."
2. **During the talk.** Glance at them once or twice ("how's it going? still faster than classic PHP mode"). This works as a free reset when attention dips.
3. **At the end, the callback.**
   - Stop the timer.
   - **Send their time live through the API:** `POST /api/v1/me/solving-times` (or show the recorded request).
   - Show it appear on myspeedpuzzling.com.
   - Applause for the volunteer. You end with a live, real use of the API you just explained.

Risks:
- They don't finish. That's fine: "unfinished results" are a real feature (`pieces_placed`), so it's a joke either way.
- No Wi-Fi. Fall back to a screenshot.

### Draft jokes and one-liners (first drafts to adapt to your voice)

- **Classic vs. worker mode:** "Classic PHP is a speed puzzler who, after every piece, sweeps the whole puzzle back into the box, shakes it, and starts again by sorting the edges. Worker mode just… keeps the table."
- **`?token=` in v0:** "My first API auth strategy was *security through optimism*."
- **"Dummy endpoint":** "The most honest commit message I've ever written."
- **CRUD:** "I asked our business people what they think of CRUD. They said 'thank you, it's getting better'." Or: "Nobody has ever opened an app to *update an entity*. They want to *publish a competition*."
- **N+1:** "N+1 is the puzzler who walks back to the box for every single piece."
- **Serialization groups:** "a 1000-piece puzzle where every piece belongs to three different pictures, depending on who's looking."
- **Worker statefulness:** "A worker without `ResetInterface` is a hotel that doesn't clean the rooms. The next guest finds the previous guest's toothbrush, and their user id."
- **"PHP is dead":** "PHP has been declared dead more times than I've lost a corner piece under the sofa."
- **AI agent demo:** "I wrote this endpoint the modern way: I described it and then went to make coffee."

### Joke and story slots

- Cold open: the "Dummy endpoint" commit, and `?token=` in the query string ("security through optimism").
- Act 1: the phantom player bug.
- Act 2, before the benchmark: the audience guesses the speed-up.
- Act 2: the intl segfault in worker mode, or "a PHP CVE that only affects people like me".
- Act 3: Claude Code writes an endpoint while I drink coffee (video).
- Close: callback to the puzzle or the "Dummy endpoint".

---

## Proposed flow (40 min)

### Opening claim (first 30 seconds, before anything else)

> "Everything I'll show you today is real. It comes from **MySpeedPuzzling, the world's largest collection of speed puzzling results and puzzle database**, a live production platform with **over 12,000 puzzlers, used every single day**.
> And it's **open source**: every file, every query, every mistake. You can check me while I talk."

- **Verified:** github.com/MySpeedPuzzling/myspeedpuzzling.com is public and MIT-licensed.
- **QR code to the repo** on the opening slide and again on the closing slide.
- **Mark every code slide with its real path** (e.g. `src/Api/V1/CreateCollectionProcessor.php`), so "it's real" is visible all the time, not only claimed once.
- **Numbers check:** "over 12,000 puzzlers" is the registered player count (production: **12,504** on 19 Nov 2026). "Used every single day" describes the platform, not each user, so it is true without claiming 12k daily users.
- **Sizes to back up "largest":** 523k solving times, 41k puzzles, 11.3k players (local production copy). Use the live production numbers on stage.

### Cold open (3 min)
- Story: "In August 2024 I committed an endpoint called *Dummy endpoint*…"
- Timeline slide, then today's numbers.
- Who I am (20 s): 20+ years of PHP, MySpeedPuzzling, bootstrapped.
- Promise: you'll leave with 3 things:
  1. API Platform without Doctrine CRUD.
  2. Scenarios plus read/write split.
  3. Why FrankenPHP worker mode is a natural fit for APIs.
- Disclaimer: opinionated, from production.

### Act 1: Why adding the API was cheap (12 min)
1. **The resource is not your entity.** A tutorial `#[ApiResource]` on an entity vs. our DTO plus a provider. We have 0 entities exposed.
2. **Scenarios, not CRUD.**
   - `PATCH {status: published}` vs. `POST /competitions/{id}/publish`.
   - Screen → scenario → command. The business speaks the same language.
3. **Write side:** Processor → Messenger command → rich domain.
   - IDs are generated before dispatch (UUIDv7), so sync or async doesn't matter and the URL is known.
   - `Idempotency-Key` gives a UUIDv5, so a retry returns the same resource.
4. **Read side:** Provider → SQL query → Result DTO.
   - N+1 is gone with a batched insights query (fixed query count).
   - Tests assert the query count.
- 💥 Story: the phantom player.
- 🔄 Reset: joke and a recap of the "sorted pieces".

### Act 2: Making it production-grade (13 min)
5. **What comes for free:**
   - `QueryParameter` with constraints gives a 422.
   - Page and cursor pagination.
   - Validation and problem+json.
   - Swagger UI with OAuth2 login.
6. **One codebase, three kinds of caller:**
   - OAuth2 scopes become roles.
   - PATs use the `Token` scheme.
   - The internal API serves AI agents.
   - The firewall split and the `ApiUser` interface. Where does `$userId` come from?
7. **Performance:**
   - FrankenPHP worker mode. Stateless by design suits it well.
   - 🎯 Audience guess, then the **benchmark reveal**.
   - The traps: `ResetInterface` on about 52 services, the intl segfault, the CVE.
- 💥 Story: the 404s that became silent 500s (HandlerFailedException across 171 dispatches).

### Act 3: Living with it (9 min)
8. **Observability:**
   - Usage tracking via Redis → Postgres, and why not Prometheus (cardinality, real traffic numbers).
   - Sentry tracing.
   - The audit log for agents.
   - Which alerts wake me up.
9. **Mocking:** a provider that returns fake data means the OpenAPI contract and the frontend or mobile work start on day 1.
10. **AI agents:**
    - A consistent pattern means Claude Code can add an endpoint on its own.
    - 🎬 Video, about 90 seconds.
11. **Gains vs. losses** (honest table, below).

### Close (3 min)
- Decisions I'd undo: a short recap of the stories plus Jan's own.
- 3 takeaways, the same as the promise.
- Callback to the "Dummy endpoint" or the puzzle.
- QR code and links. Q&A.

---

## Gains vs. losses (draft, Jan to adjust)

| What we gain | What we pay |
|---|---|
| Domain is isolated. The API is a thin shell, so it was added 2+ years late, cheaply. | More files per endpoint: Input, Response, Provider, Processor, Message, Handler, Query, Result. |
| One command is reused by the web UI, the public API, the internal API and the CLI. | Duplication: Result DTO ↔ API Response DTO mapping. |
| Reads are tuned in plain SQL: no N+1 and no hydration cost. | 436 raw SQL queries. Renaming a column means grep and fear (tests help). |
| No serialization-group hell. One DTO = one response shape. | We don't use API Platform's Doctrine filters, its automatic pagination or Hydra; all of that is hand-made. |
| OpenAPI and Swagger come for free and are always correct. | Error mapping boilerplate (`HandlerFailedException` → 4xx). |
| A predictable pattern makes it easy for new devs and AI agents. | More concepts to learn (CQRS, Messenger, providers and processors). |
| Stateless design fits worker mode, so it's fast. | Worker mode requires discipline: `ResetInterface`, memory leaks, state bugs. |

---

## Hard facts from MySpeedPuzzling (verified in the codebase)

| | |
|---|---|
| Stack | PHP 8.5, Symfony 8, API Platform 5, Postgres 18, FrankenPHP worker mode |
| Public API v1 | 32 resources, 38 operations (29 GET, 4 POST, 2 PUT, 3 DELETE) |
| Internal API (agents) | about 90 routes (plain Symfony controllers), all named after scenarios |
| Write side | 592 messages, about 620 handlers |
| Read side | 436 queries (raw SQL), 559 result DTOs |
| Tests | 303 public API tests and 278 internal API tests, with real Postgres and query-count assertions |
| Data | 11.3k players, 41k puzzles, 523k solving times; 2,830 commits since Oct 2023 |
| Entities exposed as `#[ApiResource]` | **0** |

## War stories found in the code

- **Wrapped exceptions:** `HandlerFailedException` turned 404s into silent 500s across 171 `dispatch()` calls. The fix was `UnwrapHttpExceptionMiddleware`.
- **Phantom player:** passing the player UUID instead of the user id created a phantom player. A test now guards against it.
- **API Platform 5 upgrade:** DB unique violations became 422s that showed raw SQL to clients. The fix was `exception_to_status`.
- **Worker mode:**
  - An intl/ICU SIGSEGV after watcher reloads.
  - A PHP CVE about state surviving between requests; the build now fails below 8.5.12.
- **Usage stats:** Prometheus was rejected (cardinality). Real traffic is 25–446 requests a day, from 72 PATs and 9 OAuth clients.

## Benchmark plan (worker vs. classic)

- A separate container from the same image with `APP_ENV=prod`, no Xdebug, `opcache.validate_timestamps=0`, and the local production DB.
- Run A: worker on. Run B: worker off. Warm-up first, same concurrency, report p50/p95/p99 and RPS.
- Endpoints:
  1. `/api/v1/me`
  2. `/api/v1/puzzles/{id}`
  3. `/api/v1/puzzles?limit=20&pieces_min=1000`
  4. `/api/v1/puzzles?limit=100`
  5. `/api/v1/players/{top}/results`
  6. `/api/v1/me/solving-times/deleted`
  7. `/api/docs.json`
- Lift the puzzle-search rate limit in the bench container only.

## Content files (detailed material per topic)

- `content/two-write-paths.md`: **A (MSP: processor + pure command) vs. B (Fantasy Academy: message = resource, `messenger: 'input'`, the handler returns the response via `HandledStamp`)**, the trade-off table, "what do YOU think?" and Jan's rule
- `content/user-id-two-ways.md`: where `$userId` comes from, explicit vs. `UserAwareMiddleware` (Jan to choose)
- `content/crud-vs-read-model.md`: `/me/results` measured: 7 queries vs. 9,210 queries / 9,559 entities
- `content/observability.md`: the stack, real production p50/p95, alerts with the exclusions, API usage stats
- `benchmark/results/RESULTS.md`: worker vs. classic numbers
- `examples/Demo/`: ping and mocked leaderboard endpoints (contract-first demo)
- `content/war-stories.md`: the worker-mode identity leak (released New Year's Eve 2025 at 02:29, real fix 3 days 14 h later, with a CineStar Nov 2025 parallel) + the Auth0 exit (10,256 users, wet-ink signature), with a callback structure
- `content/intro-claude-code-video.md`: cold-open terminal video, "make me a million dollar business… Revenue: €0.00", plus a 2:29 a.m. callback variant (VHS-rendered)
- `content/memes.md`: 7 meme concepts with ComfyUI prompts and captions (deploy-and-sleep, one sign-on for everyone, CineStar karma, wet-ink signature…)

---

## Deck format (decided): replicate the TechMeetup #43 decks

**Reference:**
- [techmeetup-43-jobless-devs](https://github.com/JanMikes/techmeetup-43-jobless-devs)
- spec: [DECK-RECIPE.md](https://github.com/JanMikes/techmeetup-43-clean-context/blob/main/DECK-RECIPE.md)

**Published** as a static website on a domain Jan controls (GitHub Pages + CNAME), with a QR code on the title/closing slide.

**What this means for the content we're writing now:**

- **Plain HTML/CSS/JS, terminal aesthetic, monospace everywhere.**
  - No build, no CDN, no network. Runs from a USB stick.
  - One `<section class="slide">` per slide.
- **Slide anatomy** (write content in this shape):
  - `h3` eyebrow
  - `h1`/`h2` big statement, with forced `<br>`
  - an optional `.term` block
  - an optional `.why` takeaway
  - the hidden `.act` label
  - `.notes-src` speaker notes with **bold delivery cues**
- **Slide types:**
  - `s-title`
  - `s-statement` (3–5 s beats)
  - `s-rule`
  - `s-image` (memes)
  - `s-closing` (QR)
  - normal slides with `.term`
- **Code = short `.term` blocks with manual `<mark>`**, no syntax highlighter.
  - At most **3 highlighted tokens per slide**.
  - The highlighted words across the deck should read as a sentence.
- **Benchmark charts:** ASCII bars inside `.term`, on a verified character grid. They fit the look and work on a phone.
- **Memes:** `s-image` with webp at 960/1440/1920.
  - Captions as HTML text over or under the image, not baked in.
  - This keeps them readable, theme-aware and editable.
  - Generate in ComfyUI at build time.
- **Intro "million dollar business" video → do it IN the deck, not as an MP4.**
  - A JS typewriter in a `.term` block, styled like Claude Code.
  - Theme-aware, works on phones and offline, editable text.
  - VHS/MP4 only as a fallback.
  - The real Claude Code demo in Act 3 stays a recorded video (local file).
- **Must work at 390px:** the audience follows on their phones. Keep tables and diagrams narrow.
- **Never put slide numbers in notes** ("as on the benchmark slide", not "slide 14").
- **Companion page** (long-form, linked from the QR):
  - the full benchmark tables and method
  - CRUD vs. read model numbers
  - links to the real MSP files
  - the fact-check list
  - everything that doesn't fit on a slide

  Most of `content/*.md` and `benchmark/results/RESULTS.md` ends up there.
- **CONTENT.md companion with a fact-check table** (like the jobless-devs deck). Our numbers are already verified, with sources in `content/*`.
- **Slide count:** the #43 decks run about 24 slides / 12 min, using many short beats. For 40 min, plan **about 60–75 slides**, not 35–45: many 3–5 s statement beats and memes, plus about 20 "real" slides.
- `recording/`: **the cold-open recording.**
  - A real Claude Code session gets the meme prompt "create me puzzle endpoint that will make me a million dollar…".
  - A hidden setup prompt (`--append-system-prompt-file`) makes it build `GET /v1/puzzles/{puzzleId}/leaderboard` on the existing `GetPuzzleSolvers` read model, with validation, pagination, OpenAPI and tests, then open a draft PR.
  - It ends with "Estimated revenue: $0.00."
  - Recorded with asciinema and embedded with a vendored asciinema-player. The PR is closed afterwards.
