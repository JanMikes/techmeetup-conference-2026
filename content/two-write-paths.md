# Two ways from HTTP to Messenger: "Is it worth the extra layer?"

On stage this is **an architecture decision for the audience, not a verdict**. Show both, give the trade-offs honestly, then ask: **"What do YOU think?"** (a show of hands). Jan gives his own rule of thumb at the end, clearly labeled as an opinion.

Checked on 19 Nov 2026 against the code of both projects:
- **MSP:** `src/Api/V1/*Processor.php`
- **Fantasy Academy:** `api/src/Message/**`, the open-source repo `Fantasy-Academy/fantasy-academy`

---

## A) For clean-code lovers: MySpeedPuzzling

`HTTP → Input DTO → Processor → Command → Handler (void) → the Processor builds the Response`

```php
// src/Api/V1/CreateCollectionProcessor.php: the processor is an adapter
$user = $this->security->getUser();
assert($user instanceof ApiUser);
$collectionId = Uuid::uuid7()->toString();

$this->messageBus->dispatch(new CreateCollection(      // a pure command: no API attributes
    collectionId: $collectionId,
    playerId: $user->getPlayer()->id->toString(),      // explicit
    name: $data->name,
));

return $this->responseFor($collectionId);              // the response is built from the read side
```

- **Files per write endpoint:** about 5 (Input, Processor, Command, Handler, Response).
- **The public contract and the command are different classes.** API v1 can stay frozen while the domain changes.
- **The same command is used by 4 callers:** the web UI, the public API, the internal API and the CLI.
- **Handlers return `void`**, so any command can move to async without changing the API.

## B) For pragmatic developers: Fantasy Academy

`HTTP → the Message IS the resource → API Platform's built-in Messenger processor → UserAware middleware → Handler returns the Response`

**No custom processor at all.** The command carries the API metadata itself:

```php
// api/src/Message/Subscription/CreateCheckoutSession.php (Fantasy Academy, real code)
#[Post(
    uriTemplate: '/subscription/checkout',
    output: CheckoutSessionResponse::class,
    messenger: 'input',                       // ← dispatch the input straight to the bus
)]
readonly final class CreateCheckoutSession implements UserAware
{
    use WithUserId;                           // ← the middleware fills it in

    public function __construct(
        #[Assert\Choice(['monthly', 'yearly'])] public string $plan,   // ← validation on the command
        private ?Uuid $userId = null,
    ) {}
}
```

```php
// the handler returns the response DTO
public function __invoke(CreateCheckoutSession $message): CheckoutSessionResponse
```

### "How do we return responses?" Answer: API Platform already does it

API Platform's own Messenger processor (`vendor/api-platform/core/src/Symfony/Messenger/Processor.php`):

```php
$handledStamp = $envelope->last(HandledStamp::class);
if (!$handledStamp instanceof HandledStamp) {
    return $data;                       // async: nothing handled yet
}
return $handledStamp->getResult();      // sync: the handler's return value IS the response
```

- **Sync:** whatever the handler returns gets serialized as the response (`output:` declares its class for OpenAPI).
- **Async:** there is no `HandledStamp`, so use `status: 202, output: false` (or 204, like FA's change-password).
- **Writes only.** Reads still need a provider, in both architectures.

### Where `$userId` comes from in B

The `UserAware` middleware fills it in at dispatch time from `Security` (with the `ReceivedStamp` guard so async consumers don't run it again). **CLI or another context:** ignore the middleware and pass the id through the constructor (`new ChangePassword($pwd, userId: $id)`). It works. It's a slight code smell, because the message has a "half-built" state.

Full code for both `$userId` variants: `content/user-id-two-ways.md`.

---

## Is it worth the extra layer?

| | **A: processor + pure command** | **B: message = resource** |
|---|---|---|
| Files per write endpoint | ~5 | **~2–3** |
| Mapping code | Input → Command → Response | **none** |
| Validation | on the Input DTO | **on the command itself** |
| `$userId` | explicit, every time (or one helper) | **automatic** (middleware) |
| The public API contract | **decoupled** from the domain | *is* the command: rename a field = an API change |
| Command reuse (web, CLI, other APIs with different shapes) | **easy** | the command has an API shape; other callers must fit it |
| Handler returns | `void`, so **it can go async** anytime | the response DTO: going async changes the API |
| API Platform attributes in the domain layer | **no** | yes |
| The command is always a complete, valid object | **yes** | `userId` is nullable until the middleware runs |
| CQRS purity (commands don't return data) | **yes** | no, and pragmatically that's fine |

### Jan's rule of thumb (labeled as an opinion)

> **"If you own every client, the message can be the contract.
> If strangers integrate with you, put a layer between."**

- **Fantasy Academy:** the API and the frontend are in **the same repo**, written by the same team, for one client. If the contract changes, both sides change in one PR. **B is the right call.**
- **MySpeedPuzzling:** a **public API v1** with OAuth apps and PATs used by people I've never met, plus the web UI, the internal agent API and the CLI on the same commands. **A pays for itself.**

That's why it isn't "MSP good, FA bad". Both are Jan's projects, and both are deliberate choices.

---

## Slide sequence (Act 1, after "Scenarios, not CRUD")

1. **WRITE SIDE, THE CLEAN WAY** (A): a processor of about 8 lines.
2. **WRITE SIDE, THE PRAGMATIC WAY** (B): the message *is* the resource, with `messenger: 'input'`. "No processor. No mapping."
3. **"HOW DOES IT RETURN A RESPONSE?"** The 4 lines of API Platform's processor: `HandledStamp->getResult()`. "The handler's return value *is* the response."
4. **WHERE DOES `$userId` COME FROM?** A: explicit. B: middleware. "Explicit beats magic… until you resolve the logged-in player by hand in 426 files."
5. **IS IT WORTH THE EXTRA LAYER?** The table, cut to 5 rows for the slide.
6. **WHAT DO YOU THINK?** A show of hands: "Who's team A? Team B?" **Count them out loud.** It's a reset and a laugh.
7. **MY RULE:** "own every client → the message is the contract. Strangers integrate → a layer between." "Both are my projects. I chose differently, on purpose."
