# Intro video: "Claude, make me a million dollar business"

**Slot:** cold open, slide 2–3, about 40 s, no voice-over. Jan just watches it with the audience.
**The meme:** "ChatGPT, make me a million dollar business. Make no mistakes." Everyone has seen it. We play it straight in a Claude Code terminal, then twist it.

> **Update:** the intro is now a **real recorded Claude Code session** that builds a real endpoint. See `recording/README.md`. Version A below is superseded and kept only as the pure-typewriter fallback. Version B stays an option for the Act 2 callback.

## Version A: "the business is real, the money is not" (superseded, fallback only)

```
╭─────────────────────────────────────────────╮
│ ✻ Claude Code                               │
╰─────────────────────────────────────────────╯

> build me a million dollar business. make no mistakes.

● I'll start by understanding the market…
  ⎿ Researched 47 industries

● Speed puzzling. People who solve 1000-piece jigsaws against a timer.
  Highly engaged, completely underserved niche.

● Write(src/…)  ✓ 592 commands, 620 handlers
● Write(src/Query/…)  ✓ 436 SQL queries
● Bash(deploy)  ✓ myspeedpuzzling.com is live

● Done! Your business:
  ✓ 12,000+ puzzlers
  ✓ used every single day
  ✓ world's largest speed puzzling database
  ✓ public API, OAuth2, open source

  Revenue: €0.00

  You said "make no mistakes", not "make money".

> …
```

Cut to the title slide: "Hi, I'm Jan. That's my project. Everything I'll show you today runs there."

**Why it works:**
- It lands the opening claim (real project, real users, open source) as a joke instead of a brag.
- It's self-deprecating, which buys goodwill early.
- It sets up the running bit: "AI is great, and you still need to know what you're doing."

## Version B: the 2:29 a.m. callback (Act 2, before the war story)

Use the same terminal style later, so the audience recognizes it:

```
> enable frankenphp worker mode. make no mistakes.

● Edit(compose.yml)  FRANKENPHP_WORKER: "1"
● Bash(git push)  ✓
● Deploy  ✗ failed
● Deploy  ✗ failed
● Deploy  ✓ 03:35 production

  Worker mode is live. 7× faster. Good night! 🌙

[ clock jumps: 07:02 ]

> why is everyone logged in as the same guy

● You're absolutely right!
```

The last line is the laugh: "You're absolutely right!" is the community's favorite Claude meme. Keep it short.

## How to produce it

**Decided by the deck format:** build it **inside the deck** as a JS typewriter in a `.term` block (no MP4). It is theme-aware, works offline and on phones, and is editable. Advance it beat by beat with the deck's next key, so Jan controls the timing of the punchline. The VHS route below stays as a fallback, or for posting a clip on social media.


- **Tool:** [VHS](https://github.com/charmbracelet/vhs) (`brew install vhs`).
  - A `.tape` script types the text at human speed and renders **MP4/GIF** with no editing.
  - It's deterministic and re-renderable. If the text changes, re-render in 10 s.
- It's a **scripted fake** of the Claude Code UI, styled to look like it, not a real session. That's fine for a meme. The real Claude Code demo (Act 3) stays a real recording.
- Theme: dark, big font (24–28 px), 1920×1080, `Set TypingSpeed 40ms`, with `Sleep` pauses for the punchlines.
- Sketch:

```tape
Output intro.mp4
Set FontSize 26
Set Width 1920
Set Height 1080
Set Theme "Catppuccin Mocha"
Type "> build me a million dollar business. make no mistakes."
Sleep 1.5s
Enter
# …print the pre-written response lines with `Type` + `Sleep`, or `cat` a file with ANSI colors
Sleep 2s
Type "  Revenue: €0.00"
Sleep 3s
```

Practical trick: put the "Claude output" in a text file with ANSI colors and print it line by line using `sleep` from a tiny bash script. VHS then just records `./fake-claude.sh`, which gives full control over colors and timing.

## Open questions (Jan)
- Version A only, or both A and B (B as a callback in Act 2)?
- Revenue line: €0.00 is the joke, but if the project actually has income (Stripe exists for memberships), switch to "Revenue: enough for the server. Sometimes."
