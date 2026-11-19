<?php
// "What if /me/results were classic Doctrine CRUD?" - loads the SAME data as GET /api/v1/me/results
// through entities, the way an entity-based API Platform resource would (lazy relations + per-row lookups).
// Run inside the bench image: php /bench/crud-results.php <variant>   (naive | fetch-join)
declare(strict_types=1);

use SpeedPuzzling\Web\Entity\PuzzleDifficulty;
use SpeedPuzzling\Web\Entity\PuzzleSolvingTime;
use SpeedPuzzling\Web\Entity\PuzzleStatistics;
use SpeedPuzzling\Web\SymfonyApplicationKernel;
use SpeedPuzzling\Web\Value\PuzzlingType;

require '/app/vendor/autoload.php';
(new Symfony\Component\Dotenv\Dotenv())->bootEnv('/app/.env');

$kernel = new SymfonyApplicationKernel('prod', false);
$kernel->boot();
/** @var Doctrine\ORM\EntityManagerInterface $em */
$em = $kernel->getContainer()->get('doctrine')->getManager();
$conn = $em->getConnection();

$playerId = '018db7f6-b9b1-7051-831d-0ef46af474ca';
$variant = $argv[1] ?? 'naive';
$pid = $conn->fetchOne('SELECT pg_backend_pid()');
$conn->executeQuery("SELECT 'BENCH-START'");
$start = hrtime(true);
$memStart = memory_get_usage();

if ($variant === 'naive') {
    // What you get by default: findBy + the serializer walking relations
    $times = $em->getRepository(PuzzleSolvingTime::class)->findBy(
        ['player' => $playerId, 'puzzlingType' => PuzzlingType::Solo],
        ['secondsToSolve' => 'ASC'],
    );
} else {
    // The "I know Doctrine" version: fetch-join puzzle + manufacturer + competition
    $times = $em->createQuery(
        'SELECT t, p, m, c FROM ' . PuzzleSolvingTime::class . ' t
         JOIN t.puzzle p LEFT JOIN p.manufacturer m LEFT JOIN t.competition c
         WHERE t.player = :player AND t.puzzlingType = :type ORDER BY t.secondsToSolve ASC',
    )->setParameters(['player' => $playerId, 'type' => PuzzlingType::Solo])->getResult();
}

$statsRepo = $em->getRepository(PuzzleStatistics::class);
$difficultyRepo = $em->getRepository(PuzzleDifficulty::class);
$out = [];
foreach ($times as $t) {
    $puzzle = $t->puzzle;
    $out[] = [
        'time_id' => $t->id->toString(),
        'puzzle_name' => $puzzle->name,                                   // lazy load #1
        'manufacturer_name' => $puzzle->manufacturer?->name,              // lazy load #2
        'competition' => $t->competition?->name,                          // lazy load #3
        'team' => $t->team,
        // "Solved N×" + community statistics + difficulty: per row, as a computed field would
        'solved_times' => $em->getRepository(PuzzleSolvingTime::class)->count(['player' => $playerId, 'puzzle' => $puzzle]),
        'statistics' => $statsRepo->findOneBy(['puzzle' => $puzzle])?->solvedTimesCount,
        'difficulty' => $difficultyRepo->find($puzzle)?->computedAt,
    ];
}
$json = json_encode($out);
$ms = (hrtime(true) - $start) / 1e6;
$conn->executeQuery("SELECT 'BENCH-END'");

$uow = $em->getUnitOfWork();
$managed = 0;
foreach ($uow->getIdentityMap() as $class => $entities) {
    $managed += count($entities);
    $perClass[substr(strrchr($class, '\\'), 1)] = count($entities);
}
arsort($perClass);
printf("variant=%s pid=%s rows=%d time=%.0fms memory=%.1fMB json=%.1fMB managed_entities=%d\n",
    $variant, $pid, count($out), $ms, (memory_get_peak_usage() - $memStart) / 1048576, strlen($json) / 1048576, $managed);
echo json_encode($perClass), "\n";
