<?php

declare(strict_types=1);

namespace SpeedPuzzling\Web\Api\V1\Demo;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;

/**
 * Talk demo: the smallest possible API Platform endpoint - no DB, no auth, static data.
 * Everything you measure here is framework + server overhead.
 */
#[ApiResource(
    shortName: 'DemoPing',
    operations: [
        new Get(uriTemplate: '/v1/demo/ping', provider: PingProvider::class),
    ],
)]
final readonly class PingResponse
{
    public function __construct(
        public string $status,
        public string $time,
    ) {
    }
}
