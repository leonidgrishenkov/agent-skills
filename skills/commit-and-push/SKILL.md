---
name: commit-and-push
description:
  Summarize staged git changes, draft a Conventional Commits-style commit message, and push to the remote. Use when the
  user asks to commit staged changes, write/generate a commit message, or commit and push.
---

# Commit and Push

This skill executes the commit and push itself — run every command below directly (shell/terminal tool), don't just
print them for the user to copy-paste. The user-facing output is the confirmation prompt in step 3 and the final report
in step 6, not the raw commands.

## Preconditions

1. Confirm there are staged changes: `git diff --cached --stat`.
   - If nothing is staged, run `git status` and tell the user what's unstaged/untracked. Ask which files to stage —
     never run `git add -A` / `git add .` blindly, it can sweep in secrets or unrelated work-in-progress files.
2. Never proceed if the repo has an in-progress merge/rebase/cherry-pick (`git status` will say so) — surface it and
   stop instead of committing over it.

## Workflow

1. **Gather context**, in parallel where possible:
   - `git diff --cached` — the actual change content (what to summarize).
   - `git log --oneline -10` — recent commits, to check for project-specific scope names or an established type set.
   - `git status` — sanity check on what's staged vs not.
2. **Draft the commit message** using [Conventional Commits](https://www.conventionalcommits.org/):
   - Format: `<type>[optional scope]: <description>`, e.g. `feat(auth): add refresh-token rotation`.
   - `type` is one of: `feat`, `fix`, `refactor`, `perf`, `test`, `build`, `ci`, `docs`, `style`, `chore`. Pick the one
     that matches the dominant change; if step 1's log shows the repo favors a different type set, follow it instead.
   - `scope` is optional — include it only when it adds clarity (a module/package/area name), and reuse names already
     seen in `git log` rather than inventing new ones.
   - `description`: imperative mood ("add", "fix", "refactor" — not "added"/"fixes"), lowercase, no trailing period,
     summary line ≤72 chars total.
   - Breaking change: append `!` after the type/scope (`feat(api)!: ...`) and/or add a `BREAKING CHANGE:` footer.
   - Body (optional, blank line after the summary): explain **why**, not a restatement of the diff. Only add one if the
     summary line isn't enough context on its own.
   - If the staged diff mixes clearly unrelated changes (e.g. a `feat` and an unrelated `fix`), say so and suggest
     splitting into separate commits rather than writing one message that papers over both.
3. **Show the drafted message to the user before committing.** A generated message can misread intent — a quick confirm
   (or edit) is cheap insurance, especially since the next step pushes to a shared branch.
4. **Run the commit** (don't just display it) using a heredoc so multi-line messages keep their formatting:
   ```bash
   git commit -m "$(cat <<'EOF'
   <summary line>

   <optional body>
   EOF
   )"
   ```
   Never pass `--no-verify` — if a pre-commit hook fails, fix the underlying issue and re-commit.
5. **Run the push**:
   - Check whether the branch tracks a remote: `git rev-parse --abbrev-ref --symbolic-full-name @{u}` (fails if not).
   - If it tracks one, run `git push`.
   - If it doesn't, ask the user before creating the upstream, then run `git push -u origin <branch>` yourself.
   - If the push is rejected (non-fast-forward, diverged history), report it and ask how to proceed — don't
     `--force`/`--force-with-lease` on your own initiative.
6. Report back with the final commit hash/summary and confirmation the push succeeded (or why it didn't).

## Guardrails

- Only commit what's already staged — don't stage additional files yourself without asking.
- Never amend or rewrite existing commits as part of this flow; always create a new commit.
- Never force-push.
- If the user is on a protected/default branch (e.g. `main`/`master`) and the repo normally uses PRs, flag that before
  pushing directly.
