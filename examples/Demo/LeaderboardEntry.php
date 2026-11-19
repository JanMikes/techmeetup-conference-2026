<?php

declare(strict_types=1);

namespace SpeedPuzzling\Web\Api\V1\Demo;

final readonly class LeaderboardEntry
{
    public function __construct(
        public int $rank,
        public string $playerName,
        public string $country,
        public int $pieces,
        public int $timeSeconds,
    ) {
    }
}
