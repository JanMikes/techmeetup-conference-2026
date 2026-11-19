# STRUCTURE: slide-by-slide draft v1

**Building Modern APIs in PHP (2026 Edition)** · TechMeetup · Fri 20 Nov 2026 · about 40 min
Format: the deck recipe (see `OUTLINE.md` → *Deck format*). These are slide ideas for fine-tuning, not final copy.

## The shape in one picture

```
 0'  COLD OPEN        "make me a million dollar endpoint" → it works → WHY? → it's all real
 5'  ACT 1  THE EASY PART       3 decisions made on day 1 (none of them for an API)
                                → predict: how many queries would CRUD fire?  (reset)
16'  ACT 2  PRODUCTION-GRADE    free stuff · 3 kinds of caller · PHP IS SLOW?
                                → predict: worker mode speed-up                (reset)
                                → 02:29 a.m. war story: one sign-on for everyone  (reset)
29'  ACT 3  LIVING WITH IT      measure / alert · AI agents are API clients
                                → callback: why the million-dollar endpoint took minutes
36'  CLOSE                      decisions I'd undo (the Auth0 reveal) · 3 takeaways · $0.00
40'
```

**Running threads (callbacks):**
- **The million-dollar endpoint.**
  - The cold open shows Claude building it.
  - Its real code is the example in Acts 1 and 2: DTO, filters, 422, pagination, OpenAPI.
  - Act 3 explains why it was easy.
  - The close returns to "$0.00".
- **"Who kept the user in memory?"**
  - The question is asked at the end of the war story in Act 2 and left open.
  - It's answered in the close: the Auth0 bundle, then the exit story.
- **Puzzle metaphors** (light, no extra slides):
  - classic PHP = sweeping the puzzle back into the box
  - N+1 = walking to the box for every piece
  - the box picture = screens / scenarios

**Predict-before-reveal moments, one per act:**
1. How many queries would Doctrine CRUD fire?
2. How much faster is worker mode?
3. How long until the identity leak was fixed?

**Highlighted words across the deck (`<mark>`) should read as one sentence:**
> NOT YOUR ENTITY · SCENARIOS · READ MODEL · FOR FREE · WORKER MODE · RESET · MEASURE · DON'T RENT IDENTITY

Legend:
- Types: `T` title, `S` statement beat (3–10 s), `R` act divider, `I` image/meme, `C` code/terminal, `D` data/chart, `V` video/animation, `X` closing.
- `✂` = CUT IF LONG.

---

## COLD OPEN (≈ 5 min, slides 1–9)

| # | T | On screen | Notes / delivery |
|---|---|---|---|
| 1 || T | **BUILDING MODERN APIS IN PHP** · 2026 EDITION · Jan Mikeš · photo · QR to the deck | It's up while people sit down. Don't introduce yourself yet. |
| 2 || S | **LET'S BUILD AN API.**<br>**THE 2026 WAY.** | "I've prepared a live coding session. Well. Sort of." |
| 3 || V | **The Claude Code conversation animation** (from `recording/session.jsonl`, sped up, about 75 s): the meme prompt "create me puzzle endpoint that will make me a million dollar, with serializers, validators, pagination, filtering, documentation" → it reads the code → writes it → tests pass → PR → **"Estimated revenue: $0.00."** | **Say nothing during it.** Let them read. Advance the beats with the remote, so the punchline lands when you want. |
| 4 || S | **IT WORKS.**<br>21 tests ✓ · PR #477 ✓ · 829 lines · **5 minutes** | Real numbers from the session (19 Nov 2026). Optional beat: "**Cost: $2.77. Revenue: $0.00.** Best business model I've ever had." |
| 5 || S | **THE INTERESTING PART<br>ISN'T THE AI.** | "The interesting part is **why** it only took 5 minutes. That's this talk." |
| 6 || C | **EVERYTHING TODAY IS REAL.**<br>MySpeedPuzzling: the world's largest collection of speed puzzling results and puzzle database · **12,500 puzzlers** · used every single day · **open source (MIT)** · QR to the repo | "Not theory. Every file path on my slides exists. You can check me while I talk." Your 20-second bio goes here, inside the claim. |
| 7 || I | A photo of a real speed-puzzling competition, or the MSP site | "Yes, people solve 1000-piece jigsaws against a timer. Competitively. (Remember that; there's a record coming later.)" |
| 8 || C | **OUR STACK** (`.term`): PHP 8.5 · Symfony 8 · API Platform 5 · Postgres 18 · FrankenPHP (worker mode) · Messenger | "**This is not best practice. This is our stack, and why I love it.** You may boo." |
| 9 || C | **YOU'LL LEAVE WITH 3 THINGS**<br>1. the resource is <mark>not your entity</mark><br>2. scenarios + read models<br>3. worker mode: how fast, and how it bites | The promise. It comes back word for word in the close. |

---

## ACT 1: THE EASY PART (≈ 14 min, slides 10–36)

| # | T | On screen | Notes / delivery |
|---|---|---|---|
| 10 || R | **ACT 1**<br>THE API WAS THE EASY PART | |
| 11 || D | **TIMELINE**<br>Oct 2023: full-stack Symfony app, **no API**<br>Aug 2024: first API<br>Feb 2026: API Platform<br>Nov 2026: 38 operations, OAuth2, PATs, AI agents | "The API arrived **two years and four months** after day 1." |
| 12 || C | **AUGUST 2024**<br>`git log`: **"Dummy endpoint"** | "The most honest commit message I've ever written." |
| 13 || C | `GET /api/…?token=…` | "Authentication: the token in the query string. **Security through optimism.**" Laugh beat. |
| 14 || S | **FEB 2026:<br>A REAL API.<br>IN ONE DAY.** | "One day, with Claude. Late, and cheap. **Why?**" (This sets up the cold open's 5 minutes: it's the same reason.) |
| 15 || S | **3 DECISIONS FROM DAY 1.<br>NONE OF THEM FOR AN API.** | The thesis of Act 1. |
| 16 || C | **THE TUTORIAL WAY** (`.term.bad`): `#[ApiResource]` on `#[ORM\Entity]` + `#[Groups]` + filters | "Every tutorial starts here. It's fine… for a todo app." |
| 17 || I | Serialization-groups meme: "a 1000-piece puzzle where every piece belongs to three pictures, depending on who's looking" | Quick laugh. |
| 18 || S | **DECISION 1**<br>THE RESOURCE IS<br><mark>NOT YOUR ENTITY</mark> | |
| 19 || D | **ENTITIES EXPOSED AS `#[ApiResource]`:**<br>**0** (of 32 resources) | Pause on the zero. |
| 20 || C | **The million-dollar endpoint, the resource** (from the PR): a readonly DTO plus `#[GetCollection(uriTemplate: '/puzzles/{puzzleId}/leaderboard', provider: …)]` | "This is what Claude wrote. One DTO = one response shape. Serialization is just… a class." The real path is on the slide. |
| 21 || S | **DECISION 2**<br><mark>SCENARIOS</mark>, NOT CRUD | |
| 22 || C | `PATCH /competitions/42 {"status":"published"}` ✗<br>`POST /competitions/42/publish` ✓ | "**Nobody has ever opened an app to *update an entity*.** They want to *publish a competition*." |
| 23 || C | **SCREEN → SCENARIO → COMMAND** (ASCII diagram): the box picture → "add solving time" → `AddPuzzleSolvingTime` → handler | "Puzzlers look at the picture on the box first. Design from the screens." Web UI, API, internal API and CLI all dispatch the **same** command. |
| 24 || C | **WRITE SIDE, THE CLEAN WAY** (A, MSP): the processor, about 8 lines: `getUser()` → `Uuid::uuid7()` → `dispatch(new CreateCollection(…playerId…))` → the response comes from the read side | "The processor is an **adapter**. The command has no idea HTTP exists." `content/two-write-paths.md` |
| 25 || C | **ID BEFORE DISPATCH**: `uuid7()`, or `uuid5(Idempotency-Key)` | "I know the URL before the command runs. Sync or async doesn't matter. A retry gives the same resource." ✂ |
| 26 || C | **WRITE SIDE, THE PRAGMATIC WAY** (B, Fantasy Academy, real code): `#[Post(…, output: CheckoutSessionResponse::class, messenger: 'input')]` on the **command itself** | "**No processor. No mapping.** The message *is* the resource. Same author, different project." |
| 27 || C | **HOW DOES IT RETURN A RESPONSE?** API Platform's own Messenger processor: `return $envelope->last(HandledStamp::class)->getResult();` | "**The handler's return value *is* the response.** Async? There's no result yet, so you send a 202." |
| 28 || C | **WHERE DOES `$userId` COME FROM?** A: explicit in every processor. B: a `UserAware` middleware fills it in (CLI: pass it via the constructor) | "Explicit beats magic… until you resolve the logged-in player by hand in **426 files**." The phantom-player bug is A's risk; B's is the half-built message. |
| 29 || D | **IS IT WORTH THE EXTRA LAYER?** A 5-row table: files per endpoint (~5 vs ~3) · mapping · contract decoupled from the domain · can go async · `$userId` | Read it neutrally. No winner yet. |
| 30 || S | **WHAT DO <mark>YOU</mark> THINK?**<br>A or B? | **A show of hands, and count it out loud.** "Team A… team B… this is going to be an interesting afterparty." A reset. |
| 31 || C | **MY RULE** (labeled "opinion"): own every client → the message can be the contract. Strangers integrate → put a layer between | "Fantasy Academy: one frontend, same repo, B. MySpeedPuzzling: public API, 4 callers, A. **Both are mine. I chose differently, on purpose.**" |
| 32 || S | **DECISION 3**<br>THE <mark>READ MODEL</mark> | |
| 33 || C | **The million-dollar endpoint, the provider** (from the PR): it calls the existing `GetPuzzleSolvers` + `PuzzlesSorter` | "**Claude didn't write a single SQL query.** The website's leaderboard already had one. The API is a new door into the same room." |
| 34 || D | **PREDICT.**<br>`GET /me/results` for our top puzzler: **2,327 results**.<br>How many SQL queries would classic Doctrine CRUD fire? | **Get hands up:** 10? 100? 1,000? |
| 35 || D | **REVEAL** (ASCII bars):<br>CRUD: **9,210 queries · 9,559 entities · 1.9 s**<br>read model: **7 queries · 0 entities · 108 ms** | "And the REST-purist version, where the client does the joins: **4,400+ HTTP requests** for one screen. Pick your poison." |
| 36 || I | N+1 meme: walking to the box for every piece | "You don't fix N+1 with a smarter ORM trick. **You ask the database the question the screen asks.**" Then: "We assert the query count in tests." *(The `QueryCountAssertions` snippet is in the companion.)* **Act 1 reset.** |

---

## ACT 2: PRODUCTION-GRADE (≈ 13 min, slides 37–63)

| # | T | On screen | Notes / delivery |
|---|---|---|---|
| 37 || R | **ACT 2**<br>PRODUCTION-GRADE | |
| 38 || C | **WHAT YOU GET <mark>FOR FREE</mark>** (from the PR): `QueryParameter` with `Choice` / `Country` / `Range` constraints for `type`, `country`, `firstAttemptOnly`, `limit` | "Filtering plus validation, declared, not coded." |
| 39 || C | `curl …/leaderboard?limit=1000` → **422** `application/problem+json` | "**It even says no to me.**" |
| 40 || C | **PAGINATION** (from the PR): page/limit, plus a cursor mention | Be honest: "Hand-made. We don't use Doctrine's paginator, because there's no Doctrine here." |
| 41 || I | **OpenAPI / Swagger UI** screenshot of the leaderboard endpoint with OAuth2 login | "Docs that can't lie, because they're generated from the code that runs." |
| 42 || C | **CONTRACT FIRST**: a demo provider returning fake data (`examples/Demo`) | "The OpenAPI spec exists **before** the real data does. Mobile and frontend start on day 1." ✂ |
| 43 || C | **ONE CODEBASE, 3 KINDS OF CALLER** (ASCII): OAuth2 apps (scopes → roles) · PATs (`Token msp_pat_…`) · AI agents (internal API, about 90 scenario endpoints) → `ApiUser` | |
| 44 || S | **"IS SPEED PUZZLING<br>A REAL THING?"** | Easter egg, the midpoint reset. "I can see it on your faces; you're still wondering. **Yes.** World records are set on our platform." |
| 45 || D | **500 PIECES: 16:30**<br>1 endpoint with Claude: **5:18**<br>→ **3 endpoints per world record** | "In the time the fastest puzzler solves 500 pieces, Claude ships three endpoints. With lower effort or better context, more." *(Jan: confirm the record; 16:30 is the fastest solo 500 on MSP.)* |
| 46 || S | **SPEAKING OF SPEED.** | The bridge to performance. |
| 47 || S | **"PHP IS SLOW."** | Pause. "…said every conference since 2008. PHP has been declared dead more times than I've lost a corner piece under the sofa." |
| 48 || C | **CLASSIC PHP, EVERY REQUEST** (ASCII lifecycle): boot kernel → build container → routing → API Platform metadata → **your code** → throw it all away | |
| 49 || I | Meme: the puzzler who sweeps the puzzle back into the box after every piece | "**Every. Single. Request.**" |
| 50 || C | **<mark>WORKER MODE</mark>** (ASCII): boot **once** → request, request, request… | FrankenPHP. One flag. |
| 51 || D | **PREDICT.**<br>`GET /api/v1/me`, classic: **23.6 ms · 167 req/s**<br>Worker mode: ? | **Hands up:** 2×? 5×? 10×? |
| 52 || D | **REVEAL** (bars): **3.0 ms · 2,368 req/s = 14×** | Let it land. |
| 53 || D | **ALL 8 ENDPOINTS** (narrow ASCII table): ping 5.7k req/s … the heavy 2 MB `/me/results` 22 → 39 | "Framework boot is a **fixed tax**. The faster your endpoint, the bigger the share you get back. A heavy query is still a heavy query." Production-like Docker on a laptop: **the ratios matter, not the absolute numbers.** |
| 54 || D | **PRODUCTION, LAST 30 DAYS: p50 23 ms** over about 10M requests | "That's worker mode, in production, right now." |
| 55 || S | **BUT.** | Tone change. |
| 56 || I | **NOVEMBER 2025**: the CineStar headline (logged into other people's accounts) | "A big cinema chain here. Customers saw other people's accounts. **I laughed.** How can that happen to a company that size?" |
| 57 || C | **31 DEC 2025** (`.term`, revealed line by line):<br>02:29 commit "worker mode fix"<br>02:33 deploy ❌<br>02:38 deploy ❌<br>03:09 deploy ❌<br>03:31 **Re-run** ✅ 03:35 live | "New Year's Eve. Half past two. Three failed deploys. Did I stop? **I pressed Re-run.**" |
| 58 || I | Meme: "02:29: WORKER MODE ON. GOOD NIGHT." / "WHAT COULD POSSIBLY GO WRONG?" | |
| 59 || I | **The inbox, 1 Jan 2026, morning** (a mocked Gmail/Mailpit-style screenshot, fake senders): ~50 emails, *URGENT*, *CRITICAL*, *BUG*, in Czech, German and English | "New Year's morning. I wake up to **50 emails**… I log in myself… **I'm someone else.** Refresh. **Someone else again.**" Asset: `content/memes.md` #8. |
| 60 || I | Meme: the crowd in identical masks, "**ONE SIGN-ON. FOR EVERYONE.**" | "Identity roulette. Every user on the site was **the last person who logged in**. The best single sign-on in the world." |
| 61 || D | **PREDICT: how long until it was really fixed?**<br>→ ~09:00 worker mode off, by hand<br>→ 1 Jan 15:16 fix #1 (reflection on a private property)<br>→ 3 Jan 17:07 **the real fix: 3 days 14 h** | "Karma ships to production faster than I do." |
| 62 || C | **LESSON** (`.term.warn`): worker mode doesn't make your code stateful. **It reveals it.** <mark>RESET</mark> at the **start** of the request · 52 `ResetInterface` services · `stateless: true` everywhere · the rule is in CLAUDE.md | Hotel joke: "A worker without reset is a hotel that doesn't clean the rooms. The next guest finds the toothbrush… and the previous guest's user id." |
| 63 || S | **WHO KEPT THE USER<br>IN MEMORY?** | "A third-party bundle. **Hold that thought.**" Leave it open. **Act 2 reset.** |

---

## ACT 3: LIVING WITH IT (≈ 6 min, slides 64–72)

| # | T | On screen | Notes / delivery |
|---|---|---|---|
| 64 || R | **ACT 3**<br>LIVING WITH IT | |
| 65 || C | **<mark>MEASURE</mark> EVERYTHING.<br>ALERT ON ALMOST NOTHING.** Four layers: Sentry · own API usage stats · Prometheus/Loki/Grafana · Alertmanager → Telegram | |
| 66 || C | **THE ALERT** (`.term`): `p90 > 500 ms for 30 min`, `EXCLUDING` result_image, stripe_webhook, sitemap, checkout_success | "Exclude what's slow by design, or you'll mute the alert, and then miss the real one. **Every alert must be actionable at 3 a.m.**" (Callback: "I know a thing or two about 3 a.m.") |
| 67 || S | **THE SCARIEST FAILURE<br>IS A CRON THAT SILENTLY<br>STOPPED 3 WEEKS AGO.** | About 50 cron check-ins plus a dead-man's switch. |
| 68 || C | **API USAGE: WHY NOT PROMETHEUS?** Per token × endpoint × status = cardinality 💥. Redis → Postgres instead · **25–446 requests a day** | "It's not big traffic. It's **good** traffic." ✂ |
| 69 || C | **AI AGENTS ARE API CLIENTS TOO**: the internal API, about 90 scenario endpoints, `curl` + OpenAPI yaml, an audit log channel | "Every morning I can answer: **what did Claude do last night?**" |
| 70 || S | **REMEMBER THE<br>MILLION-DOLLAR ENDPOINT?** | |
| 71 || C | **WHY IT TOOK 5 MINUTES**: same pattern × 38 endpoints · the read model already existed · conventions in CLAUDE.md · tests that fail loudly | "AI isn't magic. It's fast at **consistent** codebases. **A good architecture for humans is a good prompt for agents.**" |
| 72 || D | **GAINS / LOSSES** (2 narrow columns, 4 rows each). Gains: isolated domain · reuse across 4 callers · SQL reads · no groups. Losses: more files per endpoint · DTO mapping · 436 raw SQL queries · worker discipline | Be honest. "I'd pay it again." |

---

## CLOSE (≈ 4 min, slides 73–79)

| # | T | On screen | Notes / delivery |
|---|---|---|---|
| 73 || R | **DECISIONS I'D UNDO** | |
| 74 || S | **WHO KEPT THE USER IN MEMORY?**<br>→ **the Auth0 bundle** | The callback lands. "Unmaintained. I ended up running `dev-main` from **my own fork**." |
| 75 || I | Meme: wet-ink signature by candlelight, "GETTING MY OWN USERS' PASSWORDS BACK" | "A paid plan, a PGP key, and a **wet-ink executive signature**. In 2026. I had to find a pen." |
| 76 || D | **10,256 users · 0 failed · 25 minutes** | "Rehearsed on a production copy first; it caught 2 bugs. The best migration is the one your users never hear about. **<mark>Don't rent identity</mark>**: easy to move in, expensive to move out." |
| 77 || C | **3 THINGS** (the same as the promise): the resource is not your entity · scenarios + read models · worker mode: fast, so reset | Word for word, as promised. |
| 78 || S | **ESTIMATED REVENUE: $0.00.** | "…but the API is real, the 12,500 puzzlers are real, and every line is open source. Steal it." |
| 79 || X | **THANK YOU** · QR → the companion page (benchmarks, numbers, code links) · the repo · janmikes.cz | Leave it up during Q&A. |

---

## Volunteer puzzle: dropped (decided 19 Nov 2026)

## In reserve (companion page or Q&A, not on slides)
- the intl SIGSEGV in worker mode
- the PHP CVE (build fails below 8.5.12)
- `HandlerFailedException` → silent 500s across 171 dispatches
- the API Platform 5 upgrade leaking SQL in 422s
- the full benchmark table
- the CRUD code and query breakdown
- the `/me` production p95 question

## Timing check

| Part | Slides | Minutes |
|---|---:|---:|
| Cold open | 1–9 | 5 |
| Act 1 (now includes "two write paths" + the show of hands) | 10–36 | 14 |
| Act 2 | 37–63 | 13 |
| Act 3 | 64–72 | 6 |
| Close | 73–79 | 4 |
| **Total** | **79** | **≈ 42** |

**About 2 minutes over.** Q&A is outside the 40 minutes, but the talk itself has to fit. The ✂ slides are the planned cuts:
- 25, ID before dispatch: keep it as one sentence on the clean-way slide.
- 42, contract first.
- 68, API usage stats.

That's about 3 minutes, which brings the total to about 39. Confirm in the first rehearsal.

## Open for Jan
1. ~~The volunteer puzzle~~: **dropped**.
2. ~~The `$userId` variant~~: **show both** as "two write paths" (A for clean code, B for pragmatists) + "what do YOU think?"; see `content/two-write-paths.md`.
3. **Facts I need:**
   - How long the API Platform v1 work took (slide 14).
   - The speed-puzzling record for the easter egg (the "is speed puzzling real?" slides in Act 2). The MSP fastest solo 500 is 16:30; confirm it or give the official record.
   - ~~How you found out~~: **answered** (50 emails → the inbox mock + identity roulette).
   - ~~The production player count~~ **12,504** (19 Nov 2026), so say "12,500 puzzlers".
4. **Does Q&A count inside the 40 minutes?**
5. **Light puzzle metaphors** only, as above, or a stronger running theme?

## Iteration 2 (19 Nov 2026): +13 slides, deck is now 93
- 9: ⚠ DISCLAIMER: highly opinionated, CQS obsession (after OUR STACK)
- 17–24: "What they teach you in school": 4 lessons from api-platform.com docs (entity = resource, serialization groups, UserPasswordHasher wrapping persist, `#[ApiFilter]` now "not recommended"), "two years later" composite, meme, "why it hurts in year 2"
- 31: THE LAYERS: read (GET → Provider → Query → SQL) vs write (POST → Input → Processor → Command → bus → Handler → Entity → Repository); response from the read side
- 48–52: domain exceptions: rules that can't be checked at the door → `FirstTryAlreadyTaken` thrown in the handler → translated in the processor (422) and the web controller (form error) → client problem+json → Team B `exceptionToStatus` (CUT IF LONG)
- **Timing:** roughly +6 min → about 48 min. Needs cuts (candidates: 33, 52, 55, 82, lesson 4 folded into lesson 2).

## Iteration 3: why not CRUD (+4 slides, deck is 97)
- 30–33, in Decision 2 after "what the user actually wants": "Anemic entity. Overworked client." → "I solved it!" the CRUD way (7 illustrative calls, 0 transactions) → what could go wrong (crash, race, PATCH later, new client) → the scenario way (1 call; 6 rules in one transaction + 7 reactions, from AddPuzzleSolvingTimeHandler and the PuzzleSolved listeners).

## Iteration 4: gaps vs. the abstract (+18 slides, deck is 114)
- 16–18: Hour 1: `composer require api` + route import, the whole api_platform.php (trimmed), VOCABULARY (resource, input, output, provider, processor)
- 39–43: end to end: GET /v1/me/collections (resource → provider → SQL) and POST /v1/me/collections (input with #[Assert] → processor → command → handler); replaces the old "write side, the clean way" slide
- 59: body validation: Regex/Positive + Assert\Callback (CreateSolvingTimeInput)
- 66: OpenAPI as code (OpenApiOperation responses + Idempotency-Key); screenshot optional later
- 69–70: security ① firewall + access_control (scopes → roles), ② operation security / processor 403 / rate limiter 429
- 105: decision I'd undo #2: waiting 2 years, "it's addictive"
- 106–107: "what I keep hearing" + SPREAD THE WORD / underrated reason to love PHP in 2026
- 95–98: "the search feels slow" (Sentry WEB-B4, Sep 2026) → the trap (un-indexed ILIKE OR arms) → the fix: commit 6500b1a88, 2 trigram indexes, 0 lines in src/, 75→12 ms / 79→8.5 ms → PuzzleSearchEndpointTest untouched by the fix. Backup example in the notes: ef6428f47 (OR → UNION, 1.8 s → ~2 ms).
- **Timing:** about 58 min of material now. Cuts are mandatory; see the list at the top.

## Iteration 5: story flow (reordered, 114 slides). This supersedes the slide numbers above.
Each section only uses what an earlier one explained.

| # | Section | Slides | Hands over to the next one with… |
|---|---|---|---|
| 1–10 | **Cold open**: Claude builds the million-dollar endpoint → "the interesting part isn't the AI" → MSP is real → stack → ⚠ disclaimer (CQS) → the 3 promises | | "why did it take five minutes?" |
| 11–18 | **Act 1 · origin**: timeline → Dummy endpoint → ?token= → "an API in one day, why?" → Hour 1 (`composer require api`, the config) → **vocabulary** | resource, input, output, provider, processor | "by default both point at Doctrine. that default is the tutorial" |
| 19–26 | **The default** ("school"): 4 lessons from the docs → two years later → meme → why it hurts in year 2 | | "one model: reads and writes fight over one class" |
| 27 | **3 decisions from day 1**: answers the "why?" from FEB 2026 | | |
| 28–30 | **Decision 1** the resource is not your entity: 0 entities, the PR resource | | |
| 31–37 | **Decision 2** scenarios, not CRUD: publish vs PATCH → look at the box (screen → command → handler, 4 callers) → anemic entity → "I solved it!" CRUD way (7 calls) → what goes wrong → scenario way (1 call, 6 rules, 7 reactions) | | the write side is done; now the read side |
| 38–42 | **Decision 3** the read model: PR provider → predict → 9,210 vs 7 queries → N+1 meme | | "three decisions, one picture" |
| 43–49 | **Putting it together**: layers diagram → end to end, read (resource, provider → SQL) → write (input + #[Assert], processor, ID before dispatch, handler) → "that was team A, five classes" | | "is that a lot?" |
| 50–55 | **Team A vs team B**: pragmatic way → HandledStamp → $userId → table → hands up → my rule | | act 2: "is it any good?" |
| 56–60 | **Act 2 · what comes in**: QueryParameter filters → pagination → 422 → body validation (Callback) | | "some rules can't be checked at the door" |
| 61–65 | **Domain exceptions**: thrown in the handler → translated at the edge → client sees → team B one line | | errors are documented… |
| 66–67 | **Docs**: OpenAPI as code → contract first | | who calls it? |
| 68–70 | **Callers + security**: 3 kinds of caller → who are you (firewall) → what may you do (scope, 403, 429) | | midpoint reset |
| 71–73 | **Easter egg**: is speed puzzling real → record math → "speaking of speed" | | |
| 74–82 | **Worker mode**: PHP is slow → classic lifecycle → FrankenPHP → predict → p50 → RPS → production → PHP alive | | "BUT." |
| 83–91 | **War story**: CineStar → 31 Dec deploy → meme → inbox → one sign-on → 3 days 14 h → lesson → "who kept the user in memory?" (open loop) | | "how do I know before 50 emails tell me?" |
| 92–101 | **Act 3 · living with it**: observability → the one alert → "feels slow" story (one index, test untouched) → silent cron → API usage → agents + audit log | | |
| 102–104 | **Callback**: remember the million-dollar endpoint → why 5 minutes → gains/losses | | "decisions I'd undo" |
| 105–114 | **Close**: Auth0 answers the open loop → wet ink → migration → undo #2 (waiting 2 years) → as promised (3 things) → what I keep hearing → **spread the word** → $0.00 → thank you | | |

Backup of the pre-reorder deck: scratchpad `index.before-reorder.html` (temporary).

## Iteration 6
- Slide 4: no price and no revenue; run time shown as **4 min 5 s** (staged: the real session took 5 min 18 s, $2.77). All callbacks follow: "four minutes", "WHY IT TOOK 4 MINUTES", world-record math 16:30 / 4:05 = 4 endpoints.
- Open: the closing "ESTIMATED REVENUE: $0.00" slide no longer has a setup in the intro.
- Slide 5 (new): screenshot of PR #477 (CI green after the secret-puzzle canary fix, commit 69628e791); slide 4 now says 830 lines to match the PR. Deck is 115 slides, every later number shifts by one.
- Slide 9 (new): Jan's own WJPC 2026 photo of the Czech team (cropped, EXIF/GPS stripped): "CZECHIA: WORLD CHAMPIONS IN TEAMS." Deck is 116 slides.
- Slides 4+5 merged: the PR #477 screenshot with "IT WORKS. 4 min 5 s · CI green ✓" (PR, tests and lines in the small line). Deck is 115 slides.
- Removed: AUGUST 2024 (Dummy endpoint), AUTHENTICATION V0 (?token=), FEB 2026 one-day slide. Timeline drops AUG 2024; FEB 2026 reads "API Platform. in one day, with Claude." Deck is 112 slides.
- Decision 1 + "0 entities" merged into one slide (the zero is a click). Deck is 111 slides.

## Iteration 7: tier 1 cuts + story review (89 slides, about 43–45 min). This supersedes the earlier maps.

Each chapter only uses what an earlier one explained. The promise (11) maps the three acts, and the recap (87) closes them.

| Slides | Chapter | Covers | Hands over with… |
|---|---|---|---|
| 1–11 | **Cold open** | Claude builds the endpoint → it works (PR, CI green) → "the interesting part isn't the AI" → MySpeedPuzzling is real → WJPC hall → Czech world champions → stack → ⚠ disclaimer (CQS) → **promise: 3 acts** | "design · production · living with it" |
| 12–16 | **Act 1 · origin** | act opener (agenda line) → timeline (one day) → Hour 1: `composer require api`, the config → **vocabulary** (provider & processor = the HTTP touchpoint) | "by default both point at Doctrine. that default is the tutorial" |
| 17–21 | **The default** | lesson 1 entity = resource → lesson 2 groups → puzzle hell → why it hurts in year 2 | "one model: reads and writes fight" |
| 22 | **3 decisions** | the resource · scenarios · the read model (answers "why one day?") | |
| 23–24 | **Decision 1** | not your entity, 0 of 32 → the PR resource DTO | |
| 25–29 | **Decision 2** | publish vs PATCH → design from the screen → CRUD way (7 calls, crash, race) → scenario way (1 call) | "writes are scenarios, reads are screens" |
| 30–33 | **Decision 3** | predict → 9,210 vs 7 queries → N+1 | "three decisions, one picture" |
| 34–38 | **Putting it together** | layers diagram → end to end read (one slide) → write: input, processor, handler → "that was team A" | "five classes. is that a lot?" |
| 39–42 | **Team A vs B** | team B (return value = response) → $userId → hands up (trade-off line) → my rule | act 2: "is it any good?" |
| 43–49 | **Act 2 · what comes in** | agenda → filters + 422 → pagination → body validation → limit of validation → thrown in the domain → translated at the edge | |
| 50–53 | **Docs + security** | OpenAPI as code → 3 kinds of caller → who are you → what may you do | midpoint |
| 54–56 | **Midpoint** | remember the world champions → record math (4 endpoints) → speaking of speed | |
| 57–63 | **Worker mode** | PHP is slow → classic PHP meme → worker mode → predict → 14× → production 23 ms → PHP alive | "BUT." |
| 64–72 | **War story** | CineStar → 31 Dec deploy → sleep meme → inbox → one sign-on → 3 days 14 h → lesson → open loop | "how do I know before 50 emails?" |
| 73–80 | **Act 3** | agenda → observability → the one alert → feels slow → the trap → one migration → test didn't move → what to log (agents audit) | |
| 81–82 | **Callback** | remember the million-dollar endpoint → why 4 minutes | |
| 83–89 | **Close** | decisions I'd undo → Auth0 (closes the loop) → wet ink → undo #2 (waiting 2 years) → as promised → spread the word → thank you | |

Removed in tier 1: lessons 3+4, two years later, anemic statement, what could go wrong, PR provider, ID before dispatch, HandledStamp, the A/B table, the 422 slide, client sees, team B one line, contract first, lifecycle diagram, RPS table, silent cron, API usage, gains/losses, migration numbers, what I keep hearing, $0.00. Read ①+② merged.
Tier 2 (later, if rehearsal is long): K merge Hour 1 slides · L merge security + cut callers · M cut CineStar + one sign-on meme · N cut the midpoint.
