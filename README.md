# intervio-frontend

Next.js (App Router) + TypeScript UI for Intervio.

## Stack
Next.js 15 · React 19 · TypeScript · Tailwind v4 (dark-first design tokens) · React Query · Zustand.

## Local setup
```bash
cp .env.example .env.local    # NEXT_PUBLIC_API_URL points at the backend
npm install
npm run dev                   # http://localhost:3000
```
Requires intervio-backend running on `NEXT_PUBLIC_API_URL` (default `http://localhost:4000`).

## Theme
Dark-first, premium dev-tool aesthetic. One indigo accent (`#6366F1`), near-black canvas, hairline
borders. Tokens live in `src/app/globals.css` (`:root` = dark, `[data-theme='light']` = light) and
are exposed as Tailwind utilities (`bg-background`, `text-foreground`, `border-border`, …).

## Contracts
Shared WS/LLM types come from the backend. Refresh the local copy with:
```bash
npm run sync:contracts        # copies intervio-backend/src/contracts → src/lib/contracts
```

## Structure
```
src/
  app/            landing, (auth)/login, (auth)/signup, dashboard
  components/     ui/ primitives, auth/, providers
  lib/            api client, auth hooks, contracts (synced), utils
```
