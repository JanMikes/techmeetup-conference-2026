# Worker vs classic — results

## One user (1 client, sequential) — latency in ms

| Endpoint | Size | Classic p50 | Worker p50 | Saved per request | Speed-up | Classic p95 | Worker p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| ping | 0.0 kB | 4.4 | 0.8 | 3.5 ms | 5.3× | 5.2 | 1.2 |
| mock-leaderboard | 0.2 kB | 6.5 | 1.0 | 5.5 ms | 6.5× | 8.5 | 1.3 |
| me | 0.5 kB | 23.6 | 3.0 | 20.7 ms | 8.0× | 30.3 | 3.4 |
| puzzle-detail | 0.5 kB | 54.2 | 17.4 | 36.8 ms | 3.1× | 68.3 | 19.3 |
| puzzles-20-filtered | 3.6 kB | 69.3 | 35.2 | 34.1 ms | 2.0× | 90.1 | 41.3 |
| puzzles-100 | 15.9 kB | 105.5 | 51.8 | 53.7 ms | 2.0× | 137.6 | 60.0 |
| me-results-2MB | 230.7 kB | 195.0 | 108.0 | 86.9 ms | 1.8× | 409.2 | 126.7 |
| openapi-json | 95.4 kB | 111.2 | 27.5 | 83.7 ms | 4.0× | 138.2 | 30.8 |

## Under load (32 clients, 20 s, 4 CPUs) — requests per second

| Endpoint | Classic RPS | Worker RPS | Speed-up | Classic p95 ms | Worker p95 ms | Status codes (classic / worker) |
|---|---:|---:|---:|---:|---:|---|
| ping | 951 | 5673 | 6.0× | 58 | 10 | {'200': 18981} / {'200': 113440} |
| mock-leaderboard | 652 | 4675 | 7.2× | 74 | 12 | {'200': 13007} / {'200': 93485} |
| me | 167 | 2368 | 14.2× | 242 | 17 | {'200': 3308} / {'200': 47342} |
| puzzle-detail | 113 | 373 | 3.3× | 357 | 96 | {'200': 2237} / {'200': 7422} |
| puzzles-20-filtered | 57 | 160 | 2.8× | 706 | 222 | {'200': 1099} / {'200': 3168} |
| puzzles-100 | 35 | 104 | 3.0× | 1254 | 340 | {'200': 665} / {'200': 2058} |
| me-results-2MB | 22 | 39 | 1.8× | 1842 | 1007 | {'200': 400} / {'200': 751} |
| openapi-json | 30 | 137 | 4.6× | 1280 | 286 | {'200': 567} / {'200': 2700} |
