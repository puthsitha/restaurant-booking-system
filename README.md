# TableSite — Restaurant Booking System

A Cambodian restaurant booking platform: diners discover restaurants, reserve tables, and
pay a KHQR deposit; owners manage their listings; platform admins manage owners and the
system. Bilingual (Khmer + English) and dual-currency (USD + KHR).

> This repository is **scaffolded only** — no features are implemented yet. The visual
> reference for the UI lives in [`design/TableSite.reference.html`](./design/TableSite.reference.html).

## Stack

| Part      | Tech                                                              |
| --------- | ---------------------------------------------------------------- |
| Frontend  | Next.js (App Router) + TypeScript — customer app + admin panel   |
| Backend   | Node.js + Express + TypeScript                                   |
| Database  | PostgreSQL via Prisma                                            |

## Structure

```
restaurant-booking-system/
├── frontend/                  # Next.js + TypeScript
│   └── app/
│       ├── (customer)/        # diner-facing app  → /
│       └── (admin)/           # owner & platform admin panel → /admin
├── backend/                   # Node.js + Express + TypeScript
│   └── prisma/
│       └── schema.prisma      # database schema (the only backend content so far)
└── design/
    └── TableSite.reference.html   # design reference exported from Claude Design
```

The frontend is split into two parts using Next.js route groups:

- **`(customer)`** — the diner-facing booking experience.
- **`(admin)`** — the admin panel, which serves both **restaurant owners** and **platform admins**.

## Getting started

Install everything from the repo root (npm workspaces):

```bash
npm install
```

### Frontend

```bash
npm run dev:frontend      # http://localhost:3000
```

### Database (Docker)

A `docker-compose.yml` at the repo root runs PostgreSQL with credentials that
match the default `DATABASE_URL` in `backend/.env.example`:

```bash
docker compose up -d        # start Postgres on localhost:5432
docker compose down         # stop it (data is kept in a named volume)
docker compose down -v      # stop it and wipe the database
```

### Backend

```bash
cp backend/.env.example backend/.env   # then set DATABASE_URL (and CORS_ORIGIN)
npm run prisma:generate                # generate the Prisma client
npm run prisma:migrate                 # create/apply the database tables
npm run dev:backend                    # http://localhost:4000
```

The API validates its environment on startup and **fails fast** if `DATABASE_URL`
is missing. Two health endpoints are exposed:

- `GET /health` — liveness (process is up).
- `GET /health/ready` — readiness; returns `503` if Postgres is unreachable.

The server is hardened with `helmet` security headers, an explicit CORS origin
allowlist (`CORS_ORIGIN`), per-IP rate limiting, a JSON body-size cap, and a
centralized error handler that never leaks stack traces. Run the backend tests
with `npm run test --workspace backend`.

## Styling

The frontend uses [Tailwind CSS](https://tailwindcss.com). Design tokens (colors
and fonts) are exposed as Tailwind theme extensions in
`frontend/tailwind.config.ts`, mirroring `frontend/lib/theme.ts` and the CSS
custom properties in `frontend/app/globals.css`.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on every push to `main` and on
pull requests:

- **Frontend** — `next lint` and `next build`.
- **Backend** — `prisma generate` (against a Postgres service container) and the
  TypeScript build.

## Claude Code tooling

This repo ships project-scoped Claude Code tooling:

- **Skills** (`.claude/skills/`) — the [UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
  design-intelligence skills (`ui-ux-pro-max`, `design`, `design-system`,
  `ui-styling`, `brand`, `slides`, `banner-design`). Refresh them with
  `npx ui-ux-pro-max-cli init --ai claude`.
- **MCP server** (`.mcp.json`) — the [Magic](https://github.com/21st-dev/magic-mcp)
  (`@21st-dev/magic`) MCP server for UI component generation. It reads its key
  from the `MAGIC_API_KEY` environment variable, so set it before starting
  Claude Code (the key is intentionally **not** committed):

  ```bash
  export MAGIC_API_KEY="<your 21st.dev API key>"
  ```

## Design tokens

Pulled from the reference design (`design/TableSite.reference.html`) and exposed in
`frontend/lib/theme.ts` and `frontend/app/globals.css`:

- Accent `#C2410C`, Secondary `#1F6F54`, Background `#FBF7F2`, Border `#ECE1D5`, Ink `#241D19`
- Fonts: Plus Jakarta Sans (body), Noto Sans Khmer (Khmer), Outfit (display)
- Currency: USD with a KHR display rate of ~4100 ៛/$
