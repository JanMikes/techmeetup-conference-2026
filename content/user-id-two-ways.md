# Where does `$userId` come from? Two ways (Jan decides which one goes on stage)

## A) Today in MSP: explicit, in every processor

```php
final readonly class CreateCollectionProcessor implements ProcessorInterface
{
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): CollectionResponse
    {
        $user = $this->security->getUser();
        assert($user instanceof ApiUser);              // PatUser or OAuth2User - one interface

        $collectionId = Uuid::uuid7()->toString();     // id known BEFORE the command runs

        $this->messageBus->dispatch(new CreateCollection(
            collectionId: $collectionId,
            playerId: $user->getPlayer()->id->toString(),   // <- passed by hand, every time
            name: $data->name,
            // ...
        ));

        return new CollectionResponse(collectionId: $collectionId, /* ... */);
    }
}
```

Pros:
- Nothing is hidden. The message is complete when you read it.
- The same command works from the web UI, the API, the CLI and the async consumer.

Cons:
- The same 3–5 lines are repeated in every processor and controller.
- It is easy to pass the wrong id. That is how the **phantom player** bug happened: the player UUID was passed where the user id belonged.

## B) Middleware: the message asks for the user, and Messenger fills it in

Inspired by Fantasy Academy's `UserAwareMiddleware`
(github.com/Fantasy-Academy/fantasy-academy, `api/src/Services/Symfony/Messenger/UserAwareMiddleware.php`).

```php
interface UserAware
{
    public function withUserId(string $userId): static;
}

final readonly class CreateCollection implements UserAware
{
    public function __construct(
        public string $collectionId,
        public string $name,
        public ?string $userId = null,       // filled by the middleware
    ) {}

    public function withUserId(string $userId): static
    {
        return new static($this->collectionId, $this->name, $userId);
    }
}
```

```php
final readonly class UserAwareMiddleware implements MiddlewareInterface
{
    public function __construct(private Security $security) {}

    public function handle(Envelope $envelope, StackInterface $stack): Envelope
    {
        $message = $envelope->getMessage();

        // Only at dispatch time, in the HTTP request. In the async consumer there is no user,
        // but the message already carries the id it got when it was dispatched.
        if ($message instanceof UserAware && $envelope->last(ReceivedStamp::class) === null) {
            $user = $this->security->getUser() ?? throw new UnauthorizedHttpException('Bearer');
            assert($user instanceof ApiUser);
            $stamps = array_merge(...array_values($envelope->all()));   // keep every stamp
            $envelope = Envelope::wrap($message->withUserId($user->getPlayer()->userId), $stamps);
        }

        return $stack->next()->handle($envelope, $stack);
    }
}
```

The processor then shrinks to:

```php
$this->messageBus->dispatch(new CreateCollection($collectionId, $data->name));
```

Pros:
- Processors stay one-liners.
- It is impossible to forget the user or pass the wrong id.
- It is easy for an AI agent to copy.

Cons:
- It is magic. The message is incomplete until it reaches the bus.
- The CLI or a cron job dispatching a `UserAware` message has no user. It must set `userId` itself, or the middleware throws.
- The async consumer is a gotcha: without the `ReceivedStamp` check, the middleware runs again in the worker, finds no user and fails.

### Talk angle

> "Explicit beats magic, until you resolve the logged-in player by hand in 426 files."
>
> (Real counts: `RetrieveLoggedUserProfile` is used in 426 files; 20 API v1 processors call `security->getUser()`. The old "171" was the dispatch count from a different story, so don't use it here.)

Possible structure:
1. Show A first.
2. Tell the phantom player story.
3. Show B as the fix.
4. Show the async gotcha as the twist.

## Recommendation (architecture view)

**Keep A, the explicit approach, but shrink the repetition at the HTTP edge.** B is elegant on a slide, but it trades away properties that matter more:

| | A, explicit | B, middleware |
|---|---|---|
| The message is a complete, valid value object when created | ✅ | ❌ `?string $userId = null`; the handler must re-check it |
| The domain/bus is independent of the HTTP security context | ✅ | ❌ the bus reaches into `Security` (an inverted dependency) |
| CLI, cron, admin "acting as" another player | ✅ just pass the id | ⚠️ special cases |
| Async consumers | ✅ nothing to think about | ⚠️ needs the `ReceivedStamp` guard |
| Boilerplate | ❌ 3–5 lines per entry point | ✅ none |
| The phantom-player class of bug | ⚠️ possible | ✅ impossible |

**The hybrid ("A+"):**
- Keep messages explicit.
- Kill the boilerplate with **one tiny service at the edge**: `$this->currentPlayer->id()`. It does the `getUser()` + `assert(ApiUser)` + `getPlayer()` once, and throws 401 when there is no user.
- Prevent the phantom player with **types**, not magic: `PlayerId` and `UserId` value objects, so passing the wrong one doesn't compile (PHPStan fails).

```php
$this->messageBus->dispatch(new CreateCollection(
    collectionId: $collectionId,
    playerId: $this->currentPlayer->id(),   // one line, explicit, typed
    name: $data->name,
));
```

**On stage:** show B as the clever idea, the async gotcha as the twist, then A+ as "what I actually believe". That fits the talk's thesis: **commands are explicit scenarios, not magic.**
