# Observability: what we measure, how, and what wakes me up

All of it is real and checked on 19 Nov 2026 against Sentry (org `speedpuzzling`) and the infra repo `lily.srv`.

## The stack in one slide (four layers, each answers one question)

| Layer | Tool | Question it answers |
|---|---|---|
| **App errors and performance** | Sentry (errors, tracing incl. DBAL spans, profiling, crons, uptime) | "What broke, for whom, which line, which query?" |
| **API product metrics** | Own `ApiUsageSubscriber` → Redis → Postgres every 5 min | "Who uses the API, which endpoints, how fast, which errors?" (also shown to users) |
| **Infrastructure** | Prometheus + Loki + Tempo + Grafana, collected by Grafana Alloy; Traefik metrics and OTLP traces | "Is the box healthy: memory, disk, RAID, certs, 5xx at the edge?" |
| **Paging** | Alertmanager → **email + Telegram**; Healthchecks.io dead-man's switch; UptimeRobot plus Sentry uptime | "Wake me up, but only when it matters." |

## Real numbers: production, last 30 days (Sentry)

**All transactions:**

| p50 | p90 | p95 | p99 |
|---:|---:|---:|---:|
| **23 ms** | 82 ms | **115 ms** | 250 ms |

Slide line: "Half of all requests on MySpeedPuzzling finish in 23 ms. That's the worker mode from 10 minutes ago, in production."

**Public API v1, by endpoint:**

| Endpoint | p50 | p95 | p99 |
|---|---:|---:|---:|
| `GET /v1/players/{id}/results` (busiest) | 45 ms | 99 ms | 119 ms |
| `GET /v1/me/results` (the 2 MB one) | 89 ms | 334 ms | 343 ms |
| `GET /v1/me` | 72 ms | 334 ms | 349 ms |
| `GET /v1/puzzles` (search) | 51 ms | 151 ms | 176 ms |
| `GET /v1/me/puzzles/{id}/predicted-time` | 23 ms | 44 ms | |
| `POST /v1/me/solving-times` (write: command + side effects) | 114 ms | 123 ms | |
| `GET /v1/competitions` | 13 ms | | |

Caveats:
- API counts are low and sampled (multiples of 10, so a 10% sample rate). The tail percentiles of rare endpoints are noisy.
- `/me` has a p95 of 334 ms in production but 3 ms on the bench. That is a good open question for the talk: cold connections? Token lookup plus a `last_used_at` write? Worth checking in Sentry before the talk.

## What I actually alert on

### 1. Sentry: performance monitor ("Performance monitoring")

```
p90(span.duration)  over 30 min, environment: prod, transactions only
  warning   > 500 ms
  critical  > 1000 ms
  resolved  ≤ 500 ms
EXCLUDING:
  GET  result_image                      # renders a share image: slow by design
  POST stripe_webhook                    # Stripe's timing, not ours
  GET  speedpuzzling_web_sitemap__invoke # huge sitemap, crawled by bots
  GET  stripe_checkout_success           # waits for Stripe
```

The current monitor uses **p90**, not p95. Either say p90 on stage, or switch it to p95 before the talk.

Talk point: **exclude endpoints that are slow by design.** Otherwise the alert always fires, you mute it, and then you miss the real one. An alert you've learned to ignore is worse than no alert.

### 2. Sentry: issues
- "Send a notification for new issues", throttled to 30 min.
  - 404s, `AccessDenied` and `MethodNotAllowed` are ignored in the SDK (`ignore_exceptions`).
  - Expected 4xx are logged at *info* level, so they never become issues.
- **Messenger:** only messages that **exhausted all retries** are reported (`capture_soft_fails: false`). A retry that succeeds is not an incident.

### 3. Sentry crons: about 50 scheduled jobs, each with a check-in
- A job that *doesn't run* is detected, which is the failure nobody notices otherwise.
- Example: `flush-api-usage` every 5 min, `recalculate-community-stats` every 15 min, `detect-suspicious-times` twice a day.

### 4. Uptime
- Sentry uptime check on `https://myspeedpuzzling.com` every 60 s.
- An external UptimeRobot canary.
- **Healthchecks.io dead-man's switch:** the box pings every minute *only if Prometheus is healthy*. Silence means the box, the network or monitoring itself is down.

### 5. Infrastructure (Prometheus and Loki rules, "alert on what bites us")
- `HostOOMKill`: names the killed container. The box has no swap.
- `ContainerMemoryNearLimit` / `Critical` and `ContainerMemoryLeakPredicted`, which matters for **long-running workers** (worker mode!).
- `DiskWillFillSoon` (`predict_linear`), `InodesLow`, `RaidArrayDegraded`. "We just survived a drive death."
- `CertExpiringSoon`, `BackupTooOld` / `BackupFailed`.
- From Loki: `Traefik5xxSurge` (> 0.2 5xx/s for 5 min), `AppCrashKeywordSpike` (panic/fatal/segfault), `AppLogFlood`.
- **Routing:** a critical alert suppresses the matching warning, alerts are grouped, they repeat every 4 h, and an all-clear is sent when resolved.

## What I log (and what I deliberately don't)
- **The internal API audit log** has its own channel, `internal_api_audit`, and goes to stderr → Loki, not Sentry. It records one line per write by an agent: method, route, status, acting player, target ids and created id. It answers "what did Claude do last night?"
- **Scrubbers before anything leaves the app:** tokens, online-competition links and any field a player typed are removed (`before_send`).
- **No PII in metrics labels.**

## API usage statistics: why I built my own instead of Prometheus
- The question is "which token called which endpoint, how fast, with what status". As Prometheus labels that is per-token × per-endpoint × status: a **cardinality explosion** for 72 PATs and 9 OAuth clients.
- The design instead:
  - `kernel.request` starts a timer.
  - `kernel.terminate` does **one Redis round-trip**, after the response is already sent, so it adds nothing to latency.
  - A cron flushes to Postgres every 5 min.
- Users see their own usage at `/account/api-usage`.
- Real traffic: 25–446 public API requests a day. Honest note: "it's not big traffic. It's **good** traffic."
- Worker-mode rule: the subscriber keeps no object state, and nothing escapes `onTerminate()`.

## "The API feels slow" → fix the same afternoon (story structure)
1. Alert: the p90 monitor goes to warning.
2. Sentry → slowest transaction → trace waterfall → **47 identical DB spans** (an N+1), or one fat query.
3. The span shows the exact query, and the profile shows the line.
4. Fix it with a batch (`PuzzleInsightsBatch`) plus a test, `QueryCountAssertions`, so it can't come back.
5. Deploy, watch p90 recover, and get the resolved email.

(Use a real Sentry trace screenshot if you have one. A before/after waterfall is the best slide here.)

## Talk lines
- "Measure everything, alert on almost nothing."
- "Every alert must be actionable at 3 a.m. If my answer would be 'meh, tomorrow', it's not an alert, it's a dashboard."
- "The scariest failure isn't an error. It's a cron job that silently stopped running three weeks ago."
