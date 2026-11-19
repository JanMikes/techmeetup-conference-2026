#!/usr/bin/env bash
# Worker vs classic FrankenPHP on MySpeedPuzzling. Same image, same CPU budget (4 CPUs), same DB copy.
# Two passes per endpoint and mode:
#   latency    - 1 client, 300 requests sequentially  -> what ONE user feels (p50/p95/p99)
#   throughput - 32 clients for 20 s                   -> how many requests the box can serve
set -euo pipefail
cd "$(dirname "$0")"
TOKEN=$(cat .token)
AUTH="Authorization: Token $TOKEN"
mkdir -p results/raw

ENDPOINTS=(
  "ping|/api/v1/demo/ping|none"
  "mock-leaderboard|/api/v1/demo/leaderboard?limit=20|none"
  "me|/api/v1/me|auth"
  "puzzle-detail|/api/v1/puzzles/01a09008-f735-72f2-8a69-443c69cf7f8a|auth"
  "puzzles-20-filtered|/api/v1/puzzles?limit=20&pieces_min=1000|auth"
  "puzzles-100|/api/v1/puzzles?limit=100|auth"
  "me-results-2MB|/api/v1/me/results|auth"
  "openapi-json|/api/docs?format=json|openapi"
)

for MODE in worker classic; do
  PORT=$([ "$MODE" = worker ] && echo 18080 || echo 18081)
  docker compose stop worker classic >/dev/null 2>&1 || true
  docker compose up -d "$MODE" >/dev/null
  until curl -sf -o /dev/null "http://localhost:$PORT/api/v1/demo/ping"; do sleep 1; done
  for E in "${ENDPOINTS[@]}"; do
    IFS='|' read -r NAME PATH_ KIND <<<"$E"
    URL="http://localhost:$PORT$PATH_"
    H=(); [ "$KIND" = auth ] && H=(-H "$AUTH"); [ "$KIND" = openapi ] && H=(-H "Accept: application/vnd.openapi+json")
    echo ">> $MODE $NAME"
    oha --no-tui -n 200 -c 8 ${H[@]+"${H[@]}"} "$URL" --output-format quiet >/dev/null  # warm-up (opcache, worker boot, PG cache)
    oha --no-tui -n 300 -c 1 ${H[@]+"${H[@]}"} "$URL" --output-format json -o "results/raw/$MODE-$NAME-latency.json"
    oha --no-tui -z 20s -c 32 ${H[@]+"${H[@]}"} "$URL" --output-format json -o "results/raw/$MODE-$NAME-throughput.json"
  done
done
docker compose stop worker classic >/dev/null
python3 summarize.py
