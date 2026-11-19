<?php

declare(strict_types=1);

namespace SpeedPuzzling\Web\Api\V1\Demo;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;

/**
 * @implements ProviderInterface<PingResponse>
 */
final readonly class PingProvider implements ProviderInterface
{
    public function provide(Operation $operation, array $uriVariables = [], array $context = []): PingResponse
    {
        return new PingResponse(status: 'ok', time: date(DATE_ATOM));
    }
}
