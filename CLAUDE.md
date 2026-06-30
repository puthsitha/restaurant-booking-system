# CLAUDE.md

Guidance for Claude Code (and humans) working in this repository.

## Project

**TableSite** — a Cambodian restaurant booking platform (diner app + admin panel)
with KHQR deposits. Bilingual (Khmer + English), dual-currency (USD + KHR).

It is an **npm-workspaces monorepo**:

| Workspace   | Stack                                              | Dev port |
| ----------- | ------------------------------------------------- | -------- |
| `frontend/` | Next.js 14 (App Router) + React 18 + Tailwind CSS | 3000     |
| `backend/`  | Node.js + Express                                 | 4000     |
| Database    | PostgreSQL via Prisma (schema in `backend/prisma`) | 5432     |

The frontend splits into Next.js route groups: `(customer)` (diner-facing) and
`(admin)` (restaurant owners + platform admins). The design reference lives in
`design/TableSite.reference.html`; design tokens are mirrored in
`frontend/lib/theme.ts`, `frontend/app/globals.css`, and
`frontend/tailwind.config.ts` — **keep those three in sync**.

## Language & type rules

- **TypeScript everywhere**, in `strict` mode (already enabled in both
  `tsconfig.json` files). Do not loosen `strict`, and do not add `// @ts-ignore`
  or `any` to silence errors — fix the underlying type.
- Treat type errors as build failures: a change is not done until
  `npm run build:frontend` and `npm run build:backend` both pass.
- Prefer explicit return types on exported functions and `import type { … }` for
  type-only imports (`isolatedModules` is on).
- No new runtime dependencies without a clear reason; this is a scaffold and the
  dependency surface is intentionally small.

## Styling

- Use **Tailwind CSS** utility classes for new UI. Reach for the semantic theme
  tokens (`bg-accent`, `text-ink`, `border-border`, `font-display`, `font-khmer`,
  …) defined in `frontend/tailwind.config.ts` rather than hard-coding hex values.
- Khmer text should use the `font-khmer` family (`.km` helper) so the correct
  script font is applied.

## Database (Prisma)

- The schema is the source of truth: `backend/prisma/schema.prisma`.
- After editing the schema, run `npm run prisma:generate` (regenerates the
  client) and, when changing tables, `npm run prisma:migrate` for a dev migration.
- USD is the base currency; KHR is derived for display (~4100 ៛/$).
- Use Docker for a local database: `docker compose up -d` (matches the default
  `DATABASE_URL` in `backend/.env.example`).

## Commands

Run everything from the repo root (npm workspaces):

```bash
npm install                 # install all workspaces; also installs git hooks

# Dev
npm run dev:frontend        # Next.js  → http://localhost:3000
npm run dev:backend         # Express  → http://localhost:4000

# Build (must pass before committing)
npm run build:frontend
npm run build:backend

# Lint
npm run lint --workspace frontend

# Database
docker compose up -d        # start Postgres
npm run prisma:generate     # generate Prisma client
npm run prisma:migrate      # create/apply a dev migration
npm run prisma:studio       # open Prisma Studio

# Tests
npm test                    # runs each workspace's test script if present
```

### Testing

- Run the full suite with `npm test` from the root (it fans out to each
  workspace via `--workspaces --if-present`).
- When adding tests, colocate them as `*.test.ts` / `*.test.tsx` next to the code
  and wire a `test` script into that workspace's `package.json`.
- New features and bug fixes should ship with tests; a bug fix should include a
  test that fails before the fix.

## Validation checklist before committing

1. `npm run lint --workspace frontend` is clean.
2. `npm run build:frontend` and `npm run build:backend` succeed.
3. `npm test` passes.
4. The commit message follows the convention below.

## Commit messages

This repo enforces a commit convention via a `commit-msg` git hook
(`.githooks/commit-msg`, installed automatically on `npm install`). The format is:

```
<emoji> <type>(scope): short description
```

`scope` is optional. Examples:

```
✨ feat(auth): add biometric login
🐛 fix(cart): crash on empty cart
```

| Emoji | Type     | Description                              |
| ----- | -------- | ---------------------------------------- |
| ✨    | feat     | Introducing a new feature                |
| 🐛    | fix      | Fixing a bug                             |
| ♻️    | refactor | Refactoring code (no feature or fix)     |
| 📦    | build    | Build system or dependency changes       |
| 🚀    | perf     | Improving performance                    |
| 📝    | docs     | Documentation changes                    |
| ✏️    | test     | Adding or updating tests                 |
| 🎨    | style    | Non-functional code changes (formatting) |
| 🔧    | chore    | Miscellaneous tasks (config, cleanup)    |
| 🔼    | upgrade  | Upgrading dependencies                   |
| 🔒    | security | Security fixes                           |
| 🔥    | remove   | Removing code or files                   |
| ◀️    | revert   | Reverting changes                        |
| 〰️    | wip      | Work in progress                         |

See [`docs/COMMIT_CONVENTION.md`](./docs/COMMIT_CONVENTION.md) for the full rules.

## Custom Claude commands

Project slash commands live in `.claude/commands/`:

- `/review` — review changed code across frontend, backend, and database.
- `/fix` — diagnose and fix a failing build/lint/test or a described bug.
- `/debug` — investigate a bug or unexpected behavior and find the root cause.
