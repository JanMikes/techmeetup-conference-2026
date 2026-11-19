import json, glob, os
rows = {}
for f in glob.glob('results/raw/*.json'):
    mode, rest = os.path.basename(f)[:-5].split('-', 1)
    name, kind = rest.rsplit('-', 1)
    try:
        d = json.load(open(f))
    except ValueError:
        continue
    s, p = d['summary'], d['latencyPercentiles']
    r = rows.setdefault(name, {})
    codes = d.get('statusCodeDistribution', {})
    r[f'{mode}_{kind}'] = dict(rps=s['requestsPerSec'], p50=p['p50'] * 1000, p95=p['p95'] * 1000,
                               p99=p['p99'] * 1000, ok=s['successRate'], codes=codes,
                               size=s.get('sizePerRequest') or 0)
order = ['ping', 'mock-leaderboard', 'me', 'puzzle-detail', 'puzzles-20-filtered', 'puzzles-100', 'me-results-2MB', 'openapi-json']
out = ['# Worker vs classic — results\n',
       '## One user (1 client, sequential) — latency in ms\n',
       '| Endpoint | Size | Classic p50 | Worker p50 | Saved per request | Speed-up | Classic p95 | Worker p95 |',
       '|---|---:|---:|---:|---:|---:|---:|---:|']
for n in order:
    r = rows.get(n, {}); c, w = r.get('classic_latency'), r.get('worker_latency')
    if not c or not w: continue
    out.append(f"| {n} | {w['size']/1024:.1f} kB | {c['p50']:.1f} | {w['p50']:.1f} | {c['p50']-w['p50']:.1f} ms | {c['p50']/w['p50']:.1f}× | {c['p95']:.1f} | {w['p95']:.1f} |")
out += ['\n## Under load (32 clients, 20 s, 4 CPUs) — requests per second\n',
        '| Endpoint | Classic RPS | Worker RPS | Speed-up | Classic p95 ms | Worker p95 ms | Status codes (classic / worker) |',
        '|---|---:|---:|---:|---:|---:|---|']
for n in order:
    r = rows.get(n, {}); c, w = r.get('classic_throughput'), r.get('worker_throughput')
    if not c or not w: continue
    out.append(f"| {n} | {c['rps']:.0f} | {w['rps']:.0f} | {w['rps']/c['rps']:.1f}× | {c['p95']:.0f} | {w['p95']:.0f} | {c['codes']} / {w['codes']} |")
open('results/RESULTS.md', 'w').write('\n'.join(out) + '\n')
print('\n'.join(out))
