# AvenGO AI review Worker

This Cloudflare Worker runs the review on Cloudflare Workers AI. The browser sends only a compact eight-week strength summary to `POST /review`; model choice, prompt, output limit, validation, and rate limits stay server-side. No third-party API key is required.

## Deploy

Requirements: Node.js, a Cloudflare account, and Wrangler 4.36 or newer.

```bash
cd worker
npx.cmd wrangler login --use-keyring
npx.cmd wrangler deploy
```

The `[ai]` binding in `wrangler.toml` exposes Workers AI as `env.AI`; no API key, Account ID, or browser credential is stored in this repository. Workers Free currently includes a daily Workers AI allocation. If that allocation is exhausted, the request fails and the frontend falls back to local coaching rules.

The production model is `@cf/meta/llama-3.1-8b-instruct-fast`. A deterministic response guard removes any direct recommendation to jump between the available 3/9/13/19 lb settings and substitutes reps, slow eccentrics, or a harder variation; prompt instructions are not the only safety layer.

The current production endpoint is `https://avengo-coach.guoxinyi0811.workers.dev/review`. Its full URL is configured in the root page:

```html
<meta name="avengo-ai-endpoint" content="https://avengo-coach.guoxinyi0811.workers.dev/review">
```

Then redeploy GitHub Pages. The allowed production origin is already fixed to `https://guoxinyi0811.github.io` in `wrangler.toml`. For local Worker testing, change `ALLOWED_ORIGIN` only in a local Wrangler environment; do not loosen production CORS to `*`.

## Security boundary

- The frontend cannot select another model, change the system prompt, or forward arbitrary model request bodies.
- Workers AI is reached through the server-side `env.AI` binding, so no provider credential exists in the frontend or Git history.
- Requests are size-limited and rate-limited per local device ID plus a global Worker bucket.
- CORS and a browser device ID reduce accidental use but are not authentication. A public Worker can still be called by a determined script that spoofs headers or IDs. For stronger control, put the Worker behind Cloudflare Access or another real user-authentication layer.
- Worker responses and the browser request use `no-store`; saved review history stays in the browser’s local storage.

## Test

```bash
node test.mjs
```
