# How to start (for Bea 💙)

## Before you begin (one time)
1. Install **Node.js 20 LTS or newer** from nodejs.org. Check it with `node -v` in a terminal.
2. Install **Git** (git-scm.com) if you don't have it yet. Check it with `git --version`.
3. Make sure **Claude Code** is installed and you're logged in.
4. *(Optional, but it makes Plutus look like the real Plutus)*: put 1–3 photos of your fish in `docs/assets/plutus-reference/` (JPG or PNG).

## Start the build
1. Open a terminal **in this folder** (in File Explorer, open `Desktop\kkb`, click the address bar, type `cmd` and press Enter; or right-click → "Open in Terminal").
2. Run `claude`.
3. Paste this one message:

   > Read CLAUDE.md and everything in the docs folder, starting with docs/00-build-prompt.md. Then build KKB following the build prompt from Phase 0 to Phase 7 without stopping, and only ask me before pushing to GitHub.

4. Let it run. The folder already has pre-approved commands (`.claude/settings.json`), so it can work without asking you about every little command. It **will** still ask before pushing to GitHub or deleting files.
   - Tip: press **Shift+Tab** to switch to "accept edits" mode if it keeps asking to edit files.

## When it's done
- It will show you a summary and the commands to put KKB on GitHub. Say yes (or run them yourself).
- Then, on GitHub: **Settings → Pages → Source: GitHub Actions**. A few minutes later your app is live at **https://beapoquiz.github.io/kkb/** 🎉
- Pin the repo on your GitHub profile so people see it next to your thesis.

## If it stops halfway
Just run `claude` again in this folder and say:
> Continue building KKB. Check NOTES.md for where you left off.
