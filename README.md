# agent-skills

My collection of skills for Claude, Pi and other AI agents.

## Install

### With the `skills` CLI

Uses [`vercel-labs/skills`](https://github.com/vercel-labs/skills) (Node.js 22.20+). Works for Claude Code, Pi, Codex,
Gemini CLI and [other agents](https://github.com/vercel-labs/skills/blob/main/docs/agents.md).

Install all skills globally for Claude Code, pinned to a release tag:

```bash
npx skills add leonidgrishenkov/agent-skills@1.0.1 -g -a claude-code --skill '*' -y
```

- `@1.0.1` pins a [release tag](https://github.com/leonidgrishenkov/agent-skills/tags). Omit it to track `main`.
- `-a` accepts several agents (`-a claude-code -a pi -a codex -a gemini-cli`), or `'*'` for all.
- Skills are copied to `~/.agents/skills/` and symlinked into each agent's directory. The installed tag is recorded in
  `~/.agents/.skill-lock.json`.

```bash
npx skills add leonidgrishenkov/agent-skills --list   # skills available in this repo
npx skills list -g                                    # installed skills and their source
npx skills remove leonidgrishenkov/agent-skills -g    # uninstall every skill from this repo
```

To upgrade, run `skills add` again with the new tag. `skills update` stays on the pinned tag, so it only picks up changes
for installs without one. Re-installing does not remove skills that were deleted from this repo — remove those with
`npx skills remove <name> -g`.

The CLI sends anonymous usage telemetry. Set `DISABLE_TELEMETRY=1` to turn it off.

### Pi Coding Agent

```bash
pi install git:github.com/leonidgrishenkov/agent-skills
```

To install from a local clone instead:

```bash
pi install ./path/to/agent-skills
```

Update skills:

```bash
pi update git:github.com/leonidgrishenkov/agent-skills
```

## Releasing

Bump the version in `package.json`, commit, and create a matching `X.Y.Z` tag in one step (`.npmrc` drops npm's default
`v` prefix):

```bash
npm version minor -m "chore: release %s"   # or patch / major
git push --follow-tags
```

## Skills

| Skill                       | Description                                                                                                                  |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **personal-anki**           | Inspect, query, and manipulate a local Anki flashcard collection via the Anki Python library.                                |
| **personal-macos-pim**      | Manage macOS Calendar & Reminders via CLI — create, list, edit, delete, search events/reminders, check free/busy, RSVP.      |
| **personal-obsidian-notes** | Search, create, and manage notes in the Obsidian vault.                                                                      |
| **personal-pdf**            | Extract text/tables from PDFs, merge/split documents, create new PDFs, fill forms, and OCR scanned files.                    |
| **personal-python**         | Use uv for Python instead of the system interpreter — scripts, projects, packages, and virtual environments.                 |
| **personal-uv-python**      | Comprehensive uv guide — lockfiles, Docker/CI integration, monorepos, migration from pip/poetry, and full command reference. |
| **personal-commit-push**    | Summarize staged git changes, draft a Conventional Commits-style commit message, and push to the remote.                     |
