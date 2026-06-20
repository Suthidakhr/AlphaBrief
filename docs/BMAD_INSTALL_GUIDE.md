# BMAD METHOD — Installation Guide

**Project:** AlphaBrief  
**Date:** 2026-06-20  
**BMAD Version:** 6.8.0  
**Node.js:** v20+ required  
**IDE:** Claude Code

---

## Overview

BMAD METHOD is an AI-driven Agile framework that installs agent personas, skills, and workflow prompts into your project. It works with any tech stack. This guide covers installation on **macOS with Claude Code**.

---

## Prerequisites

| Requirement | Version | Verify with |
|---|---|---|
| Node.js | 18+ | `node --version` |
| npx | bundled with Node | `npx --version` |
| Claude Code | Latest | `claude --version` |

---

## Step 1 — Navigate to Project Root

```bash
cd /Users/suthidakhrueanak/project/AlphaBrief
```

---

## Step 2 — Run the Installer (Non-Interactive)

Run the following single command from the project root. No interactive prompts needed — all options are passed as flags.

```bash
npx bmad-method@latest install \
  --directory . \
  --modules bmm \
  --tools claude-code \
  --yes \
  --set core.user_name=Suthida \
  --set core.project_name=AlphaBrief \
  --set core.communication_language=English \
  --set core.document_output_language=English \
  --set core.output_folder=_bmad-output
```

**Flag reference:**

| Flag | Value | Purpose |
|---|---|---|
| `--modules` | `bmm` | BMad Method Agile-AI module (core is always included) |
| `--tools` | `claude-code` | Installs skills into `.claude/skills/` for Claude Code |
| `--yes` | — | Skip all interactive prompts, use defaults |
| `--set core.user_name` | Your name | Name agents use when chatting with you |
| `--set core.project_name` | Project name | Used in generated documents |
| `--set core.output_folder` | `_bmad-output` | Where generated artifacts are saved |

---

## Step 3 — Verify Installation

You should see this at the end of the install output:

```
╭─BMAD is ready to use!──────────────────────────────────────────────────────╮
│    ✓  Shared scripts                                                       │
│    ✓  BMad Core Module (v6.8.0, installed)                                 │
│    ✓  BMad Method (v6.8.0, installed)                                      │
│    ✓  Module directories                                                   │
│    ✓  Configurations (generated)                                           │
│    ✓  Help catalog                                                         │
│    ✓  claude-code (44 skills → .claude/skills)                             │
│                                                                            │
│    Installed to: /Users/suthidakhrueanak/project/AlphaBrief/_bmad          │
╰────────────────────────────────────────────────────────────────────────────╯
```

Confirm the folders exist:

```bash
ls _bmad/
ls .claude/skills/
```

Expected `_bmad/` contents:
```
bmm
config.toml
config.user.toml
core
custom
scripts
_config
```

Expected `.claude/skills/` (44 skills including):
```
bmad-help
bmad-agent-pm
bmad-agent-architect
bmad-agent-dev
bmad-create-prd
bmad-create-architecture
bmad-create-epics-and-stories
bmad-sprint-planning
bmad-code-review
bmad-qa-generate-e2e-tests
... (44 total)
```

---

## Step 4 — Activate Skills in Claude Code

BMAD skills are loaded when Claude Code starts. After installation:

1. **Open a new terminal**
2. Navigate to the project: `cd /Users/suthidakhrueanak/project/AlphaBrief`
3. Launch Claude Code: `claude`
4. Type `/bmad-help` — it should appear in autocomplete

> Skills are **not** available in an existing Claude Code session. You must open a new session after installation.

---

## Step 5 — Use BMAD Skills

Type `/bmad` in any Claude Code chat to see all available skills. Key skills:

| Skill | What it does |
|---|---|
| `/bmad-help` | Get oriented — shows what to do next |
| `/bmad-create-prd` | Create a Product Requirements Document |
| `/bmad-create-architecture` | Design system architecture |
| `/bmad-create-epics-and-stories` | Break work into epics and user stories |
| `/bmad-sprint-planning` | Plan a sprint |
| `/bmad-quick-dev` | Jump straight into development |
| `/bmad-code-review` | AI-assisted code review |
| `/bmad-qa-generate-e2e-tests` | Generate end-to-end tests |
| `/bmad-document-project` | Auto-document the project |
| `/bmad-sprint-status` | Check current sprint status |

**Start here:** `/bmad-help` — it reads your project state and recommends the next step.

---

## Updating BMAD

Run the same install command again from the project root:

```bash
npx bmad-method@latest install \
  --directory . \
  --modules bmm \
  --tools claude-code \
  --yes \
  --set core.user_name=Suthida \
  --set core.project_name=AlphaBrief \
  --set core.communication_language=English \
  --set core.document_output_language=English \
  --set core.output_folder=_bmad-output
```

Then open a new Claude Code session to reload the updated skills.

---

## File Structure After Installation

```
AlphaBrief/
├── _bmad/                        ← BMAD core (config, agents, scripts)
│   ├── config.toml               ← Main config (project name, language, output folder)
│   ├── config.user.toml          ← User config (your name, communication language)
│   ├── core/                     ← Core module files
│   ├── bmm/                      ← Agile-AI module files
│   └── scripts/                  ← Shared scripts
├── _bmad-output/                 ← Generated artifacts
│   ├── planning-artifacts/       ← PRDs, user stories, epics, architecture
│   └── implementation-artifacts/ ← Sprint status, reviews, retrospectives
├── .claude/
│   └── skills/                   ← 44 Claude Code slash command skills
├── backend/
├── frontend/
└── docs/
```

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `/bmad-help` not found | Open a new terminal and start a fresh `claude` session |
| `npx` not found | Install Node.js 18+: `brew install node` |
| Skills not showing in autocomplete | Type `/bmad` (not `/bmad-help`) to trigger the list |
| Install fails mid-way | Re-run the same install command — it is safe to re-run |
