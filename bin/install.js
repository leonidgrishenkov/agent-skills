#!/usr/bin/env node
"use strict";

/**
 * agent-skills installer
 *
 * Symlinks (or copies) the skills bundled in this package into the skills
 * directory of one or more AI agents.
 *
 * Usage:
 *   agent-skills install [--target claude|pi|codex|gemini|all] [--dir <path>] [--copy]
 *   agent-skills uninstall [--target ...] [--dir <path>]
 *   agent-skills list
 */

const fs = require("fs");
const os = require("os");
const path = require("path");

const SKILLS_ROOT = path.join(__dirname, "..", "skills");

const TARGETS = {
  claude: path.join(os.homedir(), ".claude", "skills"),
  pi: path.join(os.homedir(), ".pi", "agent", "skills"),
  codex: path.join(os.homedir(), ".codex", "skills"),
  gemini: path.join(os.homedir(), ".gemini", "skills"),
};

function parseArgs(argv) {
  const args = { command: argv[2] || "install", targets: [], dirs: [], copy: false };
  for (let i = 3; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--target") {
      args.targets.push(...argv[++i].split(","));
    } else if (a.startsWith("--target=")) {
      args.targets.push(...a.slice("--target=".length).split(","));
    } else if (a === "--dir") {
      args.dirs.push(argv[++i]);
    } else if (a.startsWith("--dir=")) {
      args.dirs.push(a.slice("--dir=".length));
    } else if (a === "--copy") {
      args.copy = true;
    } else if (a === "-h" || a === "--help") {
      args.command = "help";
    } else {
      die(`Unknown argument: ${a}`);
    }
  }
  return args;
}

function die(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}

function discoverSkills(dir) {
  // A skill is any directory containing a SKILL.md (searched one level deep).
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);
    if (fs.existsSync(path.join(full, "SKILL.md"))) {
      found.push({ name: entry.name, path: full });
    } else {
      // nested skills, e.g. skills/python/uv-python
      for (const sub of fs.readdirSync(full, { withFileTypes: true })) {
        if (!sub.isDirectory()) continue;
        const subFull = path.join(full, sub.name);
        if (fs.existsSync(path.join(subFull, "SKILL.md"))) {
          found.push({ name: sub.name, path: subFull });
        }
      }
    }
  }
  return found;
}

function resolveDestDirs(args) {
  const dirs = [...args.dirs];
  for (const t of args.targets) {
    if (t === "all") {
      dirs.push(...Object.values(TARGETS));
    } else if (TARGETS[t]) {
      dirs.push(TARGETS[t]);
    } else {
      die(`Unknown target "${t}". Known targets: ${Object.keys(TARGETS).join(", ")}, all`);
    }
  }
  if (dirs.length === 0) {
    // Default: every agent that already has its parent config dir, else claude.
    const detected = Object.entries(TARGETS)
      .filter(([, d]) => fs.existsSync(path.dirname(d)))
      .map(([, d]) => d);
    dirs.push(...(detected.length ? detected : [TARGETS.claude]));
  }
  return [...new Set(dirs)];
}

function install(args) {
  const skills = discoverSkills(SKILLS_ROOT);
  if (!skills.length) die(`No skills found under ${SKILLS_ROOT}`);

  for (const dest of resolveDestDirs(args)) {
    fs.mkdirSync(dest, { recursive: true });
    console.log(`\n→ ${dest}`);
    for (const skill of skills) {
      const link = path.join(dest, skill.name);
      if (fs.existsSync(link) || fs.lstatSync(link, { throwIfNoEntry: false })) {
        fs.rmSync(link, { recursive: true, force: true });
      }
      if (args.copy) {
        fs.cpSync(skill.path, link, { recursive: true });
      } else {
        fs.symlinkSync(skill.path, link, "dir");
      }
      console.log(`  ${args.copy ? "copied  " : "symlinked"} ${skill.name}`);
    }
  }
  console.log(`\nDone. ${skills.length} skill(s) installed${args.copy ? " (copied)" : ""}.`);
}

function update(args) {
  const pkgRoot = path.join(__dirname, "..");
  // If installed from a git clone, pull the latest changes first.
  if (fs.existsSync(path.join(pkgRoot, ".git"))) {
    console.log("→ git pull");
    try {
      require("child_process").execSync("git pull --ff-only", { cwd: pkgRoot, stdio: "inherit" });
    } catch {
      console.warn("warning: git pull failed (not a fast-forward or no remote?) — reinstalling from current files");
    }
  } else {
    console.log("→ not a git checkout; reinstalling from the installed package files");
    console.log("  (if installed via npx, refresh the package itself with: npx -y --force github:leonidgrishenkov/agent-skills update)");
  }
  install(args);
}

function uninstall(args) {
  const names = new Set(discoverSkills(SKILLS_ROOT).map((s) => s.name));
  for (const dest of resolveDestDirs(args)) {
    if (!fs.existsSync(dest)) continue;
    console.log(`\n→ ${dest}`);
    for (const name of names) {
      const link = path.join(dest, name);
      const stat = fs.lstatSync(link, { throwIfNoEntry: false });
      if (!stat) continue;
      // Only remove symlinks pointing at this package, or exact copies we made.
      if (stat.isSymbolicLink()) {
        const real = fs.realpathSync(link);
        if (!real.startsWith(SKILLS_ROOT)) continue;
      }
      fs.rmSync(link, { recursive: true, force: true });
      console.log(`  removed ${name}`);
    }
  }
}

function list() {
  for (const s of discoverSkills(SKILLS_ROOT)) {
    console.log(`${s.name}\t${s.path}`);
  }
}

function help() {
  console.log(`agent-skills — install Agent Skills for Claude Code, pi, Codex, Gemini CLI

Usage:
  agent-skills install [--target claude|pi|codex|gemini|all] [--dir <path>] [--copy]
  agent-skills update [same options]    Pull latest changes (git clones) and reinstall
  agent-skills uninstall [same options]
  agent-skills list

Options:
  --target   Agent to install for (repeatable). Default: auto-detect, fallback claude.
  --dir      Custom skills directory (repeatable).
  --copy     Copy skill folders instead of symlinking them.

Examples:
  npx github:leonidgrishenkov/agent-skills install --target claude
  npx github:leonidgrishenkov/agent-skills install --target all --copy`);
}

const args = parseArgs(process.argv);
switch (args.command) {
  case "install":
    install(args);
    break;
  case "uninstall":
    uninstall(args);
    break;
  case "update":
    update(args);
    break;
  case "list":
    list();
    break;
  default:
    help();
}
