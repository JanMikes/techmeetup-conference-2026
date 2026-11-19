<?php

declare(strict_types=1);

namespace SpeedPuzzling\Web\Api\V1\Demo;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;

/**
 * A mock: deterministic fake rows. Frontend / mobile / AI agents can integrate today.
 *
 * @implements ProviderInterface<LeaderboardResponse>
 */
final readonly class LeaderboardProvider implements ProviderInterface
{
    private const int TOTAL = 1234;

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): LeaderboardResponse
    {
        $filters = $context['filters'] ?? [];
        $pieces = (int) ($filters['pieces'] ?? 500);
        $country = (string) ($filters['country'] ?? 'cz');
        $page = (int) ($filters['page'] ?? 1);
        $limit = (int) ($filters['limit'] ?? 20);

        $items = [];
        $first = ($page - 1) * $limit + 1;

        for ($rank = $first; $rank < $first + $limit && $rank <= self::TOTAL; $rank++) {
            $items[] = new LeaderboardEntry(
                rank: $rank,
                playerName: 'Puzzler #' . $rank,
                country: $country,
                pieces: $pieces,
                timeSeconds: (int) ($pieces * 2.4) + $rank * 7,
            );
        }

        return new LeaderboardResponse(
            items: $items,
            page: $page,
            limit: $limit,
            total: self::TOTAL,
            hasMore: $page * $limit < self::TOTAL,
        );
    }
}
