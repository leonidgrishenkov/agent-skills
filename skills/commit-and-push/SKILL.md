---
name: commit-and-push
description:
  Draft a Conventional Commits-style message for staged git changes, commit them, and push to the remote. Use when the
  user asks to write/generate a commit message, commit staged changes, or commit and push.
---

# Commit and Push

This skill executes the commit and push itself — run every command below directly (shell/terminal tool), don't just
print them for the user to copy-paste. The user-facing output is the confirmation prompt in step 3 and the final report
in step 6, not the raw commands.

## How far to go

Go only as far as the user asked:

- "write/generate/suggest a commit message" → steps 1–2, then show the message. Don't commit.
- "commit" → steps 1–4 and the report. Don't push.
- "commit and push" / "push" → the full workflow.

If it's unclear which one they meant, draft the message and ask in step 3 whether to commit only or also push.

## Workflow

1. **Gather context** in one parallel batch:
   - `git status` — staged vs. unstaged files, the current branch, any in-progress merge/rebase/cherry-pick.
   - `git diff --cached --stat` — what's staged and how big it is.
   - `git log --oneline -10` — recent commits, to check for project-specific scope names, an established type set, and
     signs of a PR workflow (`Merge pull request #…` commits, `(#123)` suffixes).
   - `git rev-parse --abbrev-ref --symbolic-full-name @{u}` — the upstream branch (fails if there is none).
   - `git remote` — remote names; don't assume `origin`.

   Stop and report instead of continuing when:
   - Nothing is staged. Tell the user what's unstaged/untracked and ask which files to stage — never run `git add -A` /
     `git add .` blindly, it can sweep in secrets or unrelated work-in-progress files.
   - A merge/rebase/cherry-pick is in progress — surface it instead of committing over it.
   - HEAD is detached — there's no branch to push to.

   Then read the change content with `git diff --cached`. If `--stat` shows lockfiles or generated files, exclude them
   so they don't flood the context, e.g. `git diff --cached -- . ':(exclude)*.lock' ':(exclude)package-lock.json'`; for
   a very large diff, read it file by file. If the branch has an upstream, also run `git log @{u}..HEAD --oneline` —
   commits that are already unpushed and will go out with this push. If the repo has a commitlint config
   (`commitlint.config.*`, `.commitlintrc*`, or a `commitlint` key in `package.json`), read it — its types, scopes and
   header length override the defaults in step 2.

2. **Draft the commit message** using [Conventional Commits](https://www.conventionalcommits.org/):
   - Format: `<type>[optional scope]: <description>`, e.g. `feat(auth): add refresh-token rotation`.
   - `type` is one of: `feat`, `fix`, `refactor`, `perf`, `test`, `build`, `ci`, `docs`, `style`, `chore`. Pick the one
     that matches the dominant change; if step 1's log shows the repo favors a different type set, follow it instead.
   - `scope` is optional — include it only when it adds clarity (a module/package/area name), and reuse names already
     seen in `git log` rather than inventing new ones.
   - `description`: imperative mood ("add", "fix", "refactor" — not "added"/"fixes"), starts with a lowercase letter
     (identifiers and proper nouns like `README` or `OAuth` keep their case), no trailing period, summary line ≤72 chars
     total.
   - Breaking change: append `!` after the type/scope (`feat(api)!: ...`) and/or add a `BREAKING CHANGE:` footer.
   - Body (optional, blank line after the summary): explain **why**, not a restatement of the diff. Only add one if the
     summary line isn't enough context on its own.
   - No attribution trailers (`Co-Authored-By: <agent>`, "Generated with …") unless the user asks for them.
   - If the staged diff mixes clearly unrelated changes (e.g. a `feat` and an unrelated `fix`), say so and suggest
     splitting into separate commits rather than writing one message that papers over both.

3. **Confirm with the user before committing — stop and wait for their reply.** A generated message can misread intent,
   and a push is hard to take back, so put everything in this one prompt instead of interrupting again later:
   - the drafted message;
   - where it goes (when pushing): the branch and its upstream (`main → origin/main`), or that a new upstream will be
     created (`git push -u <remote> <branch>`) — if there are several remotes and none is set, ask which one;
   - other unpushed commits from `git log @{u}..HEAD` that the push will also send;
   - a warning if the branch is the default one (`main`/`master`) and step 1's log shows a PR workflow — pushing
     directly may bypass review, so offer to create a branch first;
   - a warning if the diff looks like it contains a secret (API key, token, private key, password, `.env` file) — once
     pushed, it has to be treated as leaked.

   Skip this step only if the user explicitly said not to ask (e.g. "commit and push, don't confirm") — and even then,
   still stop for the secret and default-branch warnings.

4. **Run the commit** (don't just display it). Shell quoting is where messages get mangled: heredocs and `$(...)` don't
   work in every shell (fish, for one), and inside double quotes bash expands the backticks and `$` that commit messages
   often contain. So:
   - A one-line message with no `'` in it: `git commit -m '<summary line>'`.
   - Anything else (a body, quotes, backticks): write the message to a temp file outside the repo with your file-writing
     tool, run `git commit -F <file>`, then delete the file.

   Never pass `--no-verify`. If a pre-commit hook fails, **the commit was not created** — so never `--amend` to retry,
   that would rewrite the previous commit. Instead:
   - If the hook rewrote files itself (formatters like prettier, ruff, black), re-stage only the files that were already
     staged and re-run the same `git commit`. If one of them was only partially staged (`git add -p`), re-staging the
     whole file would pull in its unstaged hunks too — ask the user first.
   - If the hook reports errors it can't fix (lint, type check, tests), show them to the user and ask before editing
     code — fixing them changes what's being committed.

5. **Run the push** (skip if the user only asked to commit):
   - If the branch has an upstream, run `git push`.
   - If it doesn't, run `git push -u <remote> <branch>` with the remote the user approved in step 3.
   - If the push is rejected (non-fast-forward, diverged history), report it and ask how to proceed — don't
     `--force`/`--force-with-lease` on your own initiative.

6. **Report back** with the final commit hash/summary and confirmation the push succeeded (or why it didn't).

## Guardrails

- Only commit what's already staged — don't stage additional files yourself without asking.
- Never amend or rewrite existing commits as part of this flow; always create a new commit.
- Never force-push.
- Never bypass hooks with `--no-verify`.
