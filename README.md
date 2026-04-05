# Knife (`knife.rip`)

Next.js site for **Knife** — Discord bot marketing, docs, dashboard, billing (Stripe), and Discord OAuth.

## Prerequisites

- Node.js 20+
- PostgreSQL (local [Docker](#local-postgres-via-docker) or hosted e.g. Neon, Supabase)

Prisma 7 uses the [`pg` driver](https://www.prisma.io/docs/orm/overview/databases/postgresql#using-the-nodejs-postgres-driver) via `@prisma/adapter-pg`; ensure `DATABASE_URL` is set for dev and build.

## Setup

```bash
cp .env.example .env
# Fill in secrets (see Discord + Stripe checklists below)
npm install
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Social preview (Open Graph / Twitter)

The app serves default share images at `/opengraph-image` and `/twitter-image` (see [`app/opengraph-image.tsx`](app/opengraph-image.tsx)). After deploying to **knife.rip**, refresh caches with:

- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter (X) Card Validator](https://cards-dev.twitter.com/validator) or your platform’s link-preview tool

## Discord Developer Portal checklist

1. Go to [Discord Developer Portal — Applications](https://discord.com/developers/applications) and **New Application**. Name it (e.g. Knife).
2. Under **OAuth2 → General**, copy **Client ID** and reset/copy **Client Secret** → `.env` as `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET`.
3. **Redirects — add:**
   - `http://localhost:3000/api/auth/callback/discord` (local)
   - `https://knife.rip/api/auth/callback/discord` (production)
4. **OAuth2 → URL Generator** (for testing links): scopes `identify`, `guilds` (and `email` only if you enable it in the app).
5. When the bot is ready: **Bot** tab → reset token. For prefix commands, enable **Message Content Intent** (Privileged Gateway Intents). Add other intents as features need them. Invite URL: `scope=bot` now; add `%20applications.commands` when you ship slash commands.

## Stripe

1. [Dashboard → API keys](https://dashboard.stripe.com/apikeys): set `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
2. Create a **one-time** Pro price (**$10 USD**) and set `STRIPE_PRICE_PRO_LIFETIME` in `.env`.
3. **Developers → Webhooks** → add endpoint `https://knife.rip/api/webhooks/stripe` (local: [Stripe CLI](https://stripe.com/docs/stripe-cli)) and set `STRIPE_WEBHOOK_SECRET`.

## Local Postgres via Docker

```bash
docker run --name knife-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=knife -p 5432:5432 -d postgres:16
```

Use `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/knife"`.

## Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`  | Dev server               |
| `npm run build`| Production build         |
| `npm run start`| Start production server  |
| `npm run lint` | ESLint                   |
| `npm run bot:dev` | Run Discord bot (prefix `.`) — from repo root; uses `../.env` |
| `npm run bot:start` | Run bot once without watch (same env rules) |

## Bot integration (premium check)

- **`BOT_INTERNAL_SECRET`:** Generate with `openssl rand -hex 32` (or any long random string). Set the **same** value in the site `.env` and wherever the bot runs. Never commit it. The bot sends `Authorization: Bearer <secret>` to `/api/internal/entitlement` and `/api/internal/commands`; the site rejects mismatches with 401.
- **Shared database (recommended):** In your discord.js bot, use the same `DATABASE_URL` (read-only user recommended). Resolve Discord user id → `Account` where `provider = "discord"` → `User` and check `lifetimePremiumAt` and/or legacy `subscription` (see `lib/entitlement.ts` / `lib/premium.ts`).
- **HTTP (optional):** `GET /api/internal/entitlement?discord_user_id=...` with header `Authorization: Bearer $BOT_INTERNAL_SECRET` returns `{ "premium": true|false }`. Set `BOT_INTERNAL_SECRET` in `.env`.
- **Shipped bot (`bot/`):** `cd bot && npm install`, then from repo root `npm run bot:dev` (or `npm run dev` inside `bot/`). Loads `DISCORD_BOT_TOKEN`, `BOT_INTERNAL_SECRET`, and site URL from the parent `.env`. On startup the bot POSTs its command catalog to `POST /api/internal/commands` (bearer secret). The Commands page reads from the database (no public JSON API). Helpers: `bot/src/lib/site-client.ts` (`fetchPremiumFromSite`, `postCommandRegistry`). Add commands under `bot/src/commands/` (see `registry.ts`).

## Phases

Implementation follows the project plan: foundations → Prisma → public pages → Discord auth → Stripe → bot entitlement hooks.

## License

Private — all rights reserved unless you add a license.
