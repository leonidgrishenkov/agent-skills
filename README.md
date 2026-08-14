# agent-skills

My collection of skills for Claude, Pi and other AI agents.

## Install

### With `npx`

Works for Claude Code, Pi, Codex, Gemini CLI, etc.

One-liner, no global install required:

```bash
npx -y github:leonidgrishenkov/agent-skills install --target claude
```

Targets: `claude` (`~/.claude/skills`), `pi`, `codex`, `gemini`, or `all`. Omit `--target` to auto-detect installed
agents. Skills are symlinked by default — use `--copy` to copy them instead (e.g. if the npx cache may be cleaned), or
`--dir <path>` for a custom location.

```bash
npx -y github:leonidgrishenkov/agent-skills install --target all --copy
npx -y github:leonidgrishenkov/agent-skills update --target claude
npx -y github:leonidgrishenkov/agent-skills uninstall --target claude
npx -y github:leonidgrishenkov/agent-skills list
```

`update` pulls the latest changes (when installed from a git clone) and reinstalls the skills. When using npx, add
`--force` to also refresh the cached package itself:

```bash
npx -y --force github:leonidgrishenkov/agent-skills update --target claude
```

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

## Skills

| Skill               | Description                                                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **anki**            | Inspect, query, and manipulate a local Anki flashcard collection via the Anki Python library.                                        |
| **containers**      | Run and manage containers, build images on macOS. Covers Dockerfiles, compose files, images, registries, and containerized services. |
| **macos-pim**       | Manage macOS Calendar & Reminders via CLI — create, list, edit, delete, search events/reminders, check free/busy, RSVP.              |
| **modern-cli**      | Prefer modern CLI alternatives (fd, rg, bat, eza, etc.) over legacy Unix tools when running shell commands.                          |
| **obsidian-notes**  | Search, create, and manage notes in the Obsidian vault.                                                                              |
| **pdf**             | Extract text/tables from PDFs, merge/split documents, create new PDFs, fill forms, and OCR scanned files.                            |
| **python**          | Use uv for Python instead of the system interpreter — scripts, projects, packages, and virtual environments.                         |
| **uv-python**       | Comprehensive uv guide — lockfiles, Docker/CI integration, monorepos, migration from pip/poetry, and full command reference.         |
| **commit-and-push** | Summarize staged git changes, draft a Conventional Commits-style commit message, and push to the remote.                             |
