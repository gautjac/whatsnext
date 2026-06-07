# whatsnext

**Your next thing, argued just for you.**

A bespoke cousin of [le-penchant](https://github.com/gautjac/le-penchant), rebuilt for a brand-new person who arrives with a blank slate. Instead of a pre-seeded portrait, `whatsnext` opens with a **thoughtful, multi-step questionnaire** that draws out who you are — and *why now* — then makes the persuasive case for three or four pursuits that would genuinely take root in your life. Each comes as a short editorial brief (why it fits, what it honestly costs, the smallest first step), plus an optional 30-day on-ramp.

It is its own thing, not a reskin: an **almanac / field-guide** identity — warm bone paper, deep pine ink, a marigold sun and a coral spark, set in Newsreader + Space Grotesk, on a topographic-contour ground. English-first.

## How it works

1. **Welcome** → **Questionnaire** (8 short steps + a review):
   who you are · why now · what pulls you · old flames & curiosities · the hunger
   (what you want *more* of) · your grain (hands/mind/body, solo↔social, in↔out) ·
   time & budget · constraints and hard no's.
2. The portrait is sent to Claude (Opus) server-side, which **argues four cases**,
   each written for you by name.
3. Say **"I'm in"** to shortlist a case, or **"Argue harder"** to push back and get a
   re-argued set. Build a **30-day plan** for anything that lands.

Everything is **local-first** (IndexedDB via Dexie). No account; the only thing that
leaves the device is the portrait, sent to write your briefs.

## Architecture

- **Front end** — React 19 + Vite + Tailwind. Single-page, three views
  (Questionnaire, Cases, Shortlist).
- **Back end** — two Netlify functions (`argue`, `tryout`) that call the Anthropic
  API with forced tool-use for structured output. They **stream NDJSON with
  heartbeats** so a long Opus generation outlives the proxy's idle timeout; the
  client reads to end-of-stream and parses the final line.
- **Model prompt** lives in `netlify/functions/lib/engine.ts` — the voice, the
  portrait rendering, and the two tool schemas.

```
src/
  components/   Welcome · Questionnaire · Cases · CaseCard · TryoutView · Carnet · Header · bits
  types.ts      the Profile / Brief / Tryout shapes
  profile.ts    questionnaire options + label helpers (EMPTY_PROFILE — nothing presumed)
  api.ts        portrait → wire, NDJSON reader
  db.ts         Dexie store (profile / saved / dismissed)
netlify/functions/
  argue.mts · tryout.mts   streaming endpoints
  lib/engine.ts            the Claude calls + prompts
```

## Develop

```bash
npm install
cp .env.example .env        # add your CLAUDE_API_KEY
npm run dev                 # netlify dev — front end + functions on :3272
# or, UI only (no AI):
npm run dev:vite            # :5193
```

`CLAUDE_API_KEY` is read **server-side only**. It is deliberately *not* named
`ANTHROPIC_API_KEY`, to dodge Netlify's AI-Gateway auto-injection.

## Build & deploy

```bash
npm run build               # tsc -b && vite build → dist/
```

Deploy on Netlify (publish `dist/`, functions in `netlify/functions/`). Set
`CLAUDE_API_KEY` in the site's environment variables.
