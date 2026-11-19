# Benchmark: FrankenPHP worker mode vs. classic mode on MySpeedPuzzling

**Question:** how much time does PHP lose per request booting the framework (kernel, container, routing, API Platform metadata), and what does worker mode give back?

## Setup (production-like)

- **Image:** `Dockerfile`, built on the production base image `web-base-php85`.
  - `APP_ENV=prod`, `APP_DEBUG=0`.
  - No Xdebug.
  - `opcache.validate_timestamps=0`.
  - Autoloader is `--classmap-authoritative`.
  - Cache is warmed at build time.
  - Sentry is off.
- **Code:** a copy of `~/www/speedpuzzling.cz` (build context in the scratchpad). It has two changes:
  1. The API rate limits (`api_puzzle_search`, `api_solving_time_sync`) are lifted. Otherwise everything after request 60 would be a 429.
  2. The demo endpoints from `../examples/Demo` are added to `src/Api/V1/Demo`:
     - `/api/v1/demo/ping` returns static data: no DB, no auth.
     - `/api/v1/demo/leaderboard` is a mock with filters, pagination and validation.
- **Database:** `bench-db` is its own Postgres 18.7 with a full copy of the local production DB (523k solving times). It has `shm_size: 1g` and `shared_buffers=1GB`.
- **Fairness:** the same image, 4 CPUs each and the same DB for both. Only `FRANKENPHP_WORKER` differs. The two modes are run one at a time.
- **Auth:** a personal access token (in `.token`, gitignored) belonging to the player with the most results (2,328), so `/me/results` is the worst case (about 2 MB of JSON).
- **Load tool:** [`oha`](https://github.com/hatoo/oha), an HTTP load generator like `ab` or `wrk` that reports latency percentiles.

## Runs

- **latency:** 1 client, 300 sequential requests. Shows what one user feels.
- **throughput:** 32 concurrent clients for 20 s. Shows how many requests the box serves.

Each endpoint and mode gets a warm-up first (200 requests).

```bash
docker compose up -d bench-db   # once
./run.sh                        # about 8 minutes, writes results/RESULTS.md
```

Raw `oha` JSON files are in `results/raw/` (gitignored).
