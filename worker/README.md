# AvenGO AI review Worker

This Cloudflare Worker keeps the Anthropic API key off the public GitHub Pages frontend. The browser sends only a compact eight-week strength summary to `POST /review`; model choice, prompt, output limit, validation, and rate limits stay server-side.

## Deploy

Requirements: Node.js, a Cloudflare account, Wrangler 4.36 or newer, and an Anthropic API key.

```bash
cd worker
npx wrangler login
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler deploy
```

Never put the API key in `.dev.vars`, `wrangler.toml`, `index.html`, Git history, screenshots, or issue text. The repository ignores `worker/.dev.vars`, but Cloudflare secrets are the production source of truth.

After deployment, copy the full endpoint (for example `https://avengo-coach.<account>.workers.dev/review`) into the root page:

```html
<meta name="avengo-ai-endpoint" content="https://avengo-coach.<account>.workers.dev/review">
```

Then redeploy GitHub Pages. The allowed production origin is already fixed to `https://guoxinyi0811.github.io` in `wrangler.toml`. For local Worker testing, change `ALLOWED_ORIGIN` only in a local Wrangler environment; do not loosen production CORS to `*`.

## Security boundary

- `ANTHROPIC_API_KEY` exists only as a Worker secret.
- The frontend cannot select another model, change the system prompt, or forward arbitrary Anthropic request bodies.
- Requests are size-limited and rate-limited per local device ID plus a global Worker bucket.
- CORS and a browser device ID reduce accidental use but are not authentication. A public Worker can still be called by a determined script that spoofs headers or IDs. For stronger control, put the Worker behind Cloudflare Access or another real user-authentication layer.
- Worker responses and the browser request use `no-store`; saved review history stays in the browser’s local storage.

## Test

```bash
node test.mjs
```
