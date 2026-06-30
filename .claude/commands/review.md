---
description: Review changed code across frontend, backend, and database for correctness, types, and convention issues.
---

Review the current changes in this TableSite monorepo. Scope: $ARGUMENTS
(if empty, review the working-tree diff against `main` — run
`git diff main...HEAD` and `git diff` to see staged/unstaged changes).

Focus the review on the layers touched:

**Frontend (`frontend/`, Next.js 14 + React 18 + Tailwind):**
- Correct Server vs Client Component usage (`"use client"` only where needed).
- Tailwind: uses semantic theme tokens from `frontend/tailwind.config.ts`
  (`bg-accent`, `text-ink`, `font-khmer`, …) instead of hard-coded hex/styles.
- Accessibility, `next/image` for images, no obvious hydration mismatches.
- Khmer text uses the `font-khmer`/`.km` family.

**Backend (`backend/`, Express):**
- Input validation, error handling, and correct HTTP status codes.
- No secrets or `DATABASE_URL` values committed; config read from env.
- Async/await correctness; no unhandled promise rejections.

**Database (`backend/prisma/schema.prisma` + Prisma usage):**
- Schema changes have matching migrations and a regenerated client.
- Relations, indexes, `onDelete` behavior, and enum usage are sound.
- Money stored as `Decimal` (USD base), not float.

**Cross-cutting (all TypeScript):**
- `strict` mode honored — no new `any`, `@ts-ignore`, or non-null `!` hacks.
- Builds pass: `npm run build:frontend`, `npm run build:backend`.
- `npm run lint --workspace frontend` is clean.
- Commit messages follow `docs/COMMIT_CONVENTION.md`.

Report findings ordered by severity (bugs first, then types/convention, then
nits). For each: file:line, what's wrong, and a concrete fix. Do not change code
unless I ask — this is a review.
