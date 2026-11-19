<?php

declare(strict_types=1);

namespace SpeedPuzzling\Web\Api\V1\Demo;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\QueryParameter;
use ApiPlatform\OpenApi\Model\Operation as OpenApiOperation;
use Symfony\Component\Validator\Constraints\Choice;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\Validator\Constraints\Range;

/**
 * Talk demo: contract first. The provider returns FAKE data, yet the endpoint already has
 * filtering, pagination, validation (422 problem+json) and full OpenAPI docs.
 * Swap the provider for a real query later - the contract does not change.
 */
#[ApiResource(
    shortName: 'DemoLeaderboard',
    operations: [
        new Get(
            uriTemplate: '/v1/demo/leaderboard',
            openapi: new OpenApiOperation(tags: ['Demo'], summary: 'Fastest solvers of a piece count'),
            provider: LeaderboardProvider::class,
            parameters: [
                'pieces' => new QueryParameter(
                    schema: ['type' => 'integer', 'enum' => [300, 500, 1000], 'default' => 500],
                    constraints: [new Choice(choices: [300, 500, 1000])],
                    castToNativeType: true,
                ),
                'country' => new QueryParameter(
                    schema: ['type' => 'string', 'example' => 'cz'],
                    constraints: [new Length(exactly: 2)],
                ),
                'page' => new QueryParameter(
                    schema: ['type' => 'integer', 'minimum' => 1, 'default' => 1],
                    constraints: [new Range(min: 1, max: 500)],
                    castToNativeType: true,
                ),
                'limit' => new QueryParameter(
                    schema: ['type' => 'integer', 'minimum' => 1, 'maximum' => 100, 'default' => 20],
                    constraints: [new Range(min: 1, max: 100)],
                    castToNativeType: true,
                ),
            ],
        ),
    ],
)]
final class LeaderboardResponse
{
    /**
     * @param list<LeaderboardEntry> $items
     */
    public function __construct(
        public array $items,
        public int $page,
        public int $limit,
        public int $total,
        public bool $hasMore,
    ) {
    }
}
