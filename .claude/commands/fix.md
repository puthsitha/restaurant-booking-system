---
description: Diagnose and fix a failing build/lint/test or a described bug across frontend, backend, or database.
---

Fix the problem in this TableSite monorepo: $ARGUMENTS
(if empty, find what's broken by running the checks below and fix the first
failure.)

Process:

1. **Reproduce.** Run the relevant checks to see the actual error:
   - `npm run build:frontend`
   - `npm run build:backend`
   - `npm run lint --workspace frontend`
   - `npm test`
   - For DB issues: `npm run prisma:generate` (and inspect
     `backend/prisma/schema.prisma`).
2. **Diagnose the root cause** — read the failing file and the code around it.
   Don't patch symptoms; understand why it fails.
3. **Fix it properly:**
   - Keep TypeScript `strict` — no `any`, `@ts-ignore`, or non-null `!` to
     silence the compiler. Fix the real type.
   - Frontend: use Tailwind theme tokens; respect Server/Client Component rules.
   - Backend: validate inputs, handle errors, read config from env.
   - Database: if you change `schema.prisma`, run `npm run prisma:generate` and
     add a migration when tables change.
4. **Verify** by re-running the checks that were failing until they pass, plus a
   build of any workspace you touched.
5. **Add a regression test** when fixing a bug (a test that fails before your
   fix and passes after), if a test setup exists for that workspace.

Then summarize: what was broken, the root cause, and what you changed. Commit
only if I ask; if you do, follow `docs/COMMIT_CONVENTION.md` (e.g.
`🐛 fix(scope): …`).
