# Commit convention

All commits in this repo follow a single format, enforced locally by the
`commit-msg` git hook in [`.githooks/commit-msg`](../.githooks/commit-msg).

## Format

```
<emoji> <type>(scope): short description
```

- **emoji** — the emoji matching the `type` (see table below). Required.
- **type** — one of the types below. Required.
- **scope** — optional, in parentheses, `[\w-]+` (e.g. `auth`, `cart`,
  `prisma`). Identifies the area of the change.
- **short description** — imperative, lower-case, no trailing period.

### Examples

```
✨ feat(auth): add biometric login
🐛 fix(cart): crash on empty cart
📝 docs: document the commit convention
♻️ refactor(backend): extract reservation service
```

## Types

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

## How it's enforced

The hook lives in `.githooks/` and is activated by pointing git's
`core.hooksPath` at that directory. This happens automatically the first time you
run `npm install` (via the root `package.json` `prepare` script).

To enable it manually:

```bash
git config core.hooksPath .githooks
# or
npm run hooks:install
```

Auto-generated messages (`Merge …`, `Revert …`, `fixup!`/`squash!`) are allowed
through without validation.

### Bypassing (discouraged)

```bash
git commit --no-verify -m "…"
```

Only use `--no-verify` when you truly need to; the convention keeps history
readable and changelog-friendly.
