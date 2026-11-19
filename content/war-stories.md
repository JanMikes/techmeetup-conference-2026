# War stories (checked against git history and docs in speedpuzzling.cz)

## Story 1: "For three days, MySpeedPuzzling had perfect single sign-on"

**Where in the talk:** Act 2, right after the worker-mode benchmark reveal, as the "but…" moment. It isn't about the API directly. It's the **worker-mode warning label**: after "look how fast", say "and here's how it bites". That leads into `ResetInterface` and "stateless by design".

### Prologue: the CineStar incident (November 2025)
- **What happened:** in November 2025 the CineStar website (a Czech cinema chain) collapsed under the rush for tickets to the final of *Zrádci* (The Traitors). After that, users were **logged into other people's accounts**, with their personal details and their tickets.
  - Sources: [nafilmu.cz](https://nafilmu.cz/2025/11/fanousci-zradcu-shodili-web-cinestaru-chyba-je-prihlasovala-do-cizich-uctu/) and [refresher.cz](https://refresher.cz/193089-Zradci-shodili-web-CineStaru-Kino-resi-i-bezpecnostni-problem-lidem-se-mely-zobrazovat-cizi-ucty).
- **Me:** I read it and laughed. "How can this even happen to a company that size?"
- **Six weeks later:** it happened to me.
- **Slide:** the CineStar headline on the left, my commit log on the right. Pause and let the audience connect it.
- **For a non-Czech audience:** "a big cinema chain in my country". The headline still works with a one-line translation.

### Timeline (from git, CET): the times are the joke

| When | Commit | What | Δ since release |
|---|---|---|---:|
| 30 Dec, 23:21 → 31 Dec, 02:18 | a dozen commits | "Lazy loading", "Caching", "Mercure + FrankenPHP worker mode"… a late-night performance spree | |
| **Wed 31 Dec 2025, 02:29:20** | `d203a1a94` "FrankenPHP Worker mode fix + sentry live components population" | **Worker mode goes live.** New Year's Eve, 2:29 a.m. | 0 |
| Wed 31 Dec, 02:34:47 | `742f0ca4c` "Resetting for FrankenPHP" | The first state leaks (two services) patched | **5 min 27 s** |
| Wed 31 Dec, 03:04:46 | `0f192267f` "Data for mercure" | …and keeps going at 3 a.m. | 35 min |
| **Thu 1 Jan 2026, 15:16:23** | `65c7700aa` "Auth0 resetter" | **Fix #1:** a `ResetInterface` that nulls Auth0's private `sdk` property **via reflection** | **36 h 47 min** |
| Fri 2 Jan, 19:43 → 23:36 | 5 commits | Performance work: pre-calculated statistics, indexes. *I thought it was fixed.* | |
| **Sat 3 Jan 2026, 17:07:59** | `a6d0ba033` "Auth0 Reset fix for worker mode" | **Fix #2, the real one:** `Auth0ServiceResetter` deleted, replaced by a `kernel.request` listener (priority 512) that resets the SDK **at the start of every request** | **3 days 14 h 38 min** |

Notes:
- **No revert in git.** The rollback happened by hand on the server (see below).
- Fix #1 didn't do the job, so the bug lived on, in some form, until 3 January.

### What the pipeline says (GitHub Actions "Release" workflow, checked 19 Nov 2026)

The commits tell one story. The deploys tell a better one.

| Time (CET) | Commit | Deploy (GitHub deployment, env `prod`) |
|---|---|---|
| 02:20 | `c33c6f3d8` (includes `90a7e02b2` "Mercure + FrankenPHP worker mode") | release **cancelled** (overtaken by the next push) |
| 02:33 | `d203a1a94` "FrankenPHP Worker mode fix…" | ❌ **failure** (02:36) |
| 02:38 | `742f0ca4c` "Resetting for FrankenPHP" | ❌ **failure** (02:38) |
| 03:08 | `0f192267f` "Data for mercure" | ❌ **failure** (03:09) |
| 03:31 | the **same run, re-run** (attempt 2) | ✅ **success, 03:35:16** → worker mode live in production |
| …31 Dec, the rest of the day | | **no GitHub deployment at all** |
| 1 Jan, 15:20 | `ed8ab16b9` | next deploy; the 03:35 one becomes "inactive" |

- **The real punchline:** **three failed deploys** between 02:33 and 03:09. Did I stop? No. I hit "Re-run" a fourth time. Production got worker mode at **03:35**, and I went to sleep.
- **Bonus detail:** `d203a1a94` already patched one identity leak (`RetrieveLoggedUserProfile` got a `reset()`). The 02:29 commit is literally "I noticed users leaking, fixed one, shipped". The Auth0 one was hiding deeper.
- **The revert ~5–6 h later (around 9 a.m.) is not in git or CI.** I checked re-runs (`run_attempt`) and the GitHub Deployments API: the 03:35 deployment stayed the active one until 1 Jan, 15:20, and there was no redeploy of older commits through Actions that day. Worker mode was switched with `FRANKENPHP_WORKER=1` in the server's compose file, and deploys went over SSH (`/deployment/speedpuzzling/deploy.sh` on the old box). So turning it off was a manual edit plus a restart, and it left no trace. Other places I checked:
  - The GitHub logs have expired (HTTP 410).
  - Sentry only keeps 90 days of traces.
  - Claude Code transcripts from December no longer exist.
  - **Jan: tell it from memory** ("woke up, phone full of messages, SSH, set `FRANKENPHP_WORKER=0`, restart"). If the old server still exists, its shell history or the compose file's mtime might show the time.
- **Timeline for the slide (pending Jan's memory):**
  - 03:35, deployed.
  - ~07:00, *"why am I logged in as someone else?"* Worker mode turned off by hand.
  - 1 Jan, 15:16: "Auth0 resetter".
  - 3 Jan, 17:07: the real fix, and worker mode on for good.

The code comment from fix #2 says it best:

> "Without this reset, the Auth0 SDK caches user credentials in memory, causing session leakage where one user's authentication bleeds into another user's request."

### Story beats
1. **CineStar**, the headline. "I laughed. Six weeks later…"
2. "Worker mode is amazing. You just saw the numbers. So I deployed it on **New Year's Eve at 2:29 in the morning**, like a responsible adult."
3. The commit list with timestamps, revealed one line at a time. Let the audience read the times:
   - **02:29** release.
   - **02:34** "Resetting for FrankenPHP". "Five minutes. Confident."
   - **1 Jan, 15:16** "Auth0 resetter". "New Year's Day, hangover, reflection on a private property."
   - **3 Jan, 17:07** "Auth0 Reset fix for worker mode". "The fix for the fix."
4. "New Year, new me. And for everyone on the website, literally *the same me*."
5. The symptom: **the last user who signed in became every user on the site.**
6. Joke: "For a short moment MySpeedPuzzling had the best single sign-on in the world. One sign-on. For everyone."
7. Callback: "Exactly what I laughed at CineStar for. Karma ships to production faster than I do."
8. The cause: the auth bundle kept the logged-in user **in a service property**. In classic PHP that dies with the request. In worker mode, the next request inherits it.
9. **Lesson slide (the worker-mode warning label):**
   - Worker mode doesn't make *your* code stateful. It reveals that *something* already was, often in a vendor's code you've never read.
   - Reset **at the start of the request**, not just at the end. The end is too late if something escaped.
   - Today: about 52 services implement `ResetInterface`, the rule is in `CLAUDE.md` so AI agents follow it too, and every firewall and the whole API is `stateless: true`.
   - Worth one line: "Before enabling worker mode, grep your `vendor/` for private properties holding a user. I wish I had."

### Fill in before the talk (Jan)
- ~~How did you find out?~~ **Answered:** woke up to **about 50 emails** in the MySpeedPuzzling inbox with subjects like *URGENT*, *CRITICAL*, *BUG*. Logged in myself and was someone else. Refreshed, and was someone else again.
- Roughly how many people saw someone else's account?
- Any funny user reactions or messages?

---

## Story 2: "I outsourced auth so I'd never have to think about it. Then I thought about it for 3 months."

**Where in the talk:** the decisions I'd undo, or in "one codebase, three kinds of caller" when showing native OAuth2 + PAT.

### Facts (from `docs/features/auth-migration/README.md` and git)
- **The appeal:** "Let a specialist handle passwords, resets, security. Delegate and forget."
- **The reality:**
  - The Symfony bundle was **poorly maintained**. The app ended up pinning `auth0/symfony: dev-main` **from my personal fork** under `minimum-stability: dev`, partly to get around a `roave/security-advisories` block on `auth0/symfony <= 5.5`.
  - It was the root cause of Story 1: the bundle kept the user in memory.
  - Admins were locked out by the Auth0 authenticator (fix, 11 Aug 2026).
  - Login lived on `speedpuzzling.eu.auth0.com`, which couldn't be branded on the free tier.
- **Leaving:**
  - Password hashes are **"held hostage behind a paid support ticket"**. You must upgrade to a paid plan, open a ticket with Okta, provide a **PGP key**, and sign a **"wet-ink executive acknowledgement"**: an ink signature on paper, in 2026, to get your own users' hashes.
  - Research started on 11 Jul 2026. Native registration went live on 30 Jul.
  - **Import day, 30 Jul:** first a full dress rehearsal on a restored production dump, which caught 2 script bugs. Then **10,256 users imported, 0 failed, in 25 minutes.** Users kept their passwords (bcrypt hashes imported, rehashed to argon2id on the next login).
  - 18 Sep: the bundle, the fork, the flags and the fallback were deleted. 19 Sep: tenants and secrets deleted, "nothing Auth0 left".
  - About **2.5 months** of careful work for something that was supposed to save time.

### Story beats
1. "Auth is hard, so I did the smart thing and outsourced it." (Pause.) "Narrator: it was not the smart thing."
2. The exit: "To get *my own users'* password hashes I needed a paid plan, a PGP key, and a **wet-ink signature**. I had to find a pen. In 2026."
3. The happy ending: 10,256 users moved, 0 failures, 25 minutes, and almost nobody noticed. "The best migration is the one your users never hear about."
4. **Lesson:**
   - Third-party identity is **renting**: easy to move in, expensive to move out.
   - Today the API's OAuth2 server, the PATs and the login are all native Symfony. That made "three kinds of caller" a configuration problem, not a vendor problem.

### Numbers check
You said "8,000 users". The import log says **10,256** (registered players were 9,953 on 11 Jul). Use 10k+ on stage.

---

## How the two stories connect (callback)

Story 1 is *caused by* the dependency from Story 2. Tell Story 1 in Act 2 without naming the cause ("a third-party auth bundle"). In the closing "decisions I'd undo" part, reveal: "Remember the guy everyone was logged in as? Guess which vendor's bundle kept him in memory." Then tell Story 2.
