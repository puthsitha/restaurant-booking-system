---
description: Investigate a bug or unexpected behavior across frontend, backend, or database and find the root cause.
---

Debug this issue in the TableSite monorepo: $ARGUMENTS

This command is about **understanding**, not blindly patching. Find the root
cause before proposing a fix.

1. **Clarify the symptom.** What is observed vs. expected? Which layer does it
   surface in — frontend (`frontend/`), backend (`backend/`), or database
   (Prisma / `schema.prisma`)? Identify the request/data flow involved.
2. **Form hypotheses** about the cause and rank them by likelihood.
3. **Investigate** to confirm or rule each out:
   - Search the code paths involved (`Grep`/`Glob`) and read them.
   - Frontend: check Server/Client boundaries, data fetching, hydration, console
     and network behavior; reproduce with `npm run dev:frontend` if useful.
   - Backend: trace the route/handler; reproduce with `npm run dev:backend` and
     hit the endpoint (e.g. `curl localhost:4000/...`); add temporary logging.
   - Database: inspect `schema.prisma`, the generated query, and the data; use
     `npm run prisma:studio` or a `docker compose up -d` Postgres to inspect.
4. **Pinpoint the root cause** — name the exact file:line and explain the
   mechanism (why it produces the symptom).
5. **Recommend the fix** (and the regression test that would catch it). Apply it
   only if I ask; if asked, remove any temporary debug logging first and follow
   `docs/COMMIT_CONVENTION.md`.

Report: symptom → hypotheses checked → root cause (file:line) → recommended fix.
