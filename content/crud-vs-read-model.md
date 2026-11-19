# `/me/results`: read model vs. "classic" Doctrine CRUD (measured)

**Endpoint:** `GET /api/v1/me/results` for the player with the most results.
**Data:** 2,327 solo results across 2,159 different puzzles from 237 manufacturers, about 2.1 MB of JSON.
Each result row shows:
- the puzzle name and image
- the manufacturer
- the time, date and comment
- "solved N×"
- the competition or series
- community statistics (fastest, average…)
- difficulty
- relay / unfinished data

## The numbers

| | Read model (production code) | Doctrine CRUD, naive | Doctrine CRUD, "I know Doctrine" (fetch joins) |
|---|---:|---:|---:|
| SQL queries | **7** (incl. auth) | **9,210** | 6,814 |
| Entities hydrated | 0 | **9,559** | 9,559 |
| Time | **~108 ms** (whole HTTP request, p50) | **1,890 ms** (data loading only) | 1,520 ms |
| PHP memory | small (arrays → DTOs) | **~40 MB** | ~41 MB |

How it was measured:
- **Read model:** the real endpoint in the production-like benchmark container, with Postgres statement logging on.
- **CRUD variants:** `benchmark/crud/crud-results.php`, run in the same image against the same DB.
  - They load the same rows through entities: lazy relations plus per-row `count()` / `findOneBy()`, the way computed fields on an entity resource usually end up.
  - The CRUD timings **don't include HTTP, security or API Platform serialization**, and they load *fewer* fields than the real response. Reality would be worse.

Entities touched by the CRUD version for one API call:

| Entity | Instances |
|---|---:|
| PuzzleSolvingTime | 2,327 |
| Puzzle | 2,159 |
| PuzzleStatistics | 2,159 |
| PuzzleDifficulty | 2,146 |
| Player | 531 |
| Manufacturer | 237 |
| **Total** | **9,559** |

Where the 9,210 queries go (the N+1 family photo):

| Query | Count |
|---|---:|
| `puzzle_solving_time` COUNT ("solved N×") | 2,327 |
| `puzzle_statistics` | 2,327 |
| `puzzle` (lazy proxies) | 2,159 |
| `puzzle_difficulty` | 2,159 |
| `manufacturer` | 237 |
| …plus players and the rest | |

Fetch joins remove some of them (6,814 left). The per-row computed fields remain, and fixing those means writing… a read model.

## What the read model actually runs (7 queries)

1. The PAT lookup (auth).
2. `SELECT 1 FROM player WHERE id = ?` (player exists).
3. **One** big SQL query: results + puzzle + manufacturer + competition + series + relay + "solved N×" as a CTE (`src/Query/GetPlayerSolvedPuzzles.php`).
4. **One** batch for community statistics: `WHERE puzzle_id IN (…2,159 ids)`.
5. **One** batch for difficulty: `= ANY(:puzzleIds)`.
6. The membership check, and so on.

The query count is fixed, whether you have 10 results or 10,000 (`PuzzleInsightsBatch`, enforced in tests by `QueryCountAssertions`).

## How the CRUD version would look in API Platform (the slide "before")

```php
#[ApiResource(
    operations: [new GetCollection(uriTemplate: '/me/results')],
    normalizationContext: ['groups' => ['result:read']],
    paginationItemsPerPage: 30,
)]
#[ApiFilter(SearchFilter::class, properties: ['player' => 'exact', 'puzzlingType' => 'exact'])]
#[ORM\Entity]
class PuzzleSolvingTime
{
    #[Groups(['result:read'])] #[ORM\ManyToOne] public Puzzle $puzzle;            // → Puzzle needs groups too
    #[Groups(['result:read'])] #[ORM\ManyToOne] public ?Competition $competition; // → and Competition, Series…
    #[Groups(['result:read'])] public ?int $secondsToSolve;

    #[Groups(['result:read'])]
    public function getSolvedTimes(): int { /* needs a repository inside an entity?! */ }

    #[Groups(['result:read'])]
    public function getPuzzleStatistics(): ?PuzzleStatistics { /* inverse OneToOne on Puzzle → +1 query per row */ }
}
// + a Doctrine QueryExtension to hide hidden players
// + a custom normalizer for embargoed images (hide_image_until)
// + a security extension so "/me" only returns MY results
// + serialization groups on Puzzle, Manufacturer, Competition, CompetitionSeries, RelayResult, PuzzleStatistics, PuzzleDifficulty
```

The alternative that really happens in "pure REST CRUD" is that the client does the joins:
- `GET /solving_times?player=X` × 78 pages (30 per page)
- plus `GET /puzzles/{id}` × 2,159
- plus statistics and difficulty per puzzle

That is **4,400+ HTTP requests to draw one screen** (78 + 2,159 + 2,159, before difficulty).

## Talk lines

- "One screen, one call, seven queries. The CRUD version of the same screen: nine thousand queries, or over four thousand HTTP requests. Pick your poison."
- "You don't fix N+1 with a smarter ORM trick. You fix it by **asking the database the question the screen asks**."
- Honest note: fetch joins plus batch loading can get Doctrine much closer. But at that point you're hand-writing a read model, only with 9,559 objects in memory you don't need.
