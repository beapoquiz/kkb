# KKB — project memory for Claude Code

**KKB** ("Kanya-Kanyang Bayad", Filipino for *everyone pays their own share*) is a cute, pastel bill splitter for groups of friends. The mascot is **Plutus**, a chubby blue fish named after Bea's real pet fish. The app is a static React + TypeScript site deployed to GitHub Pages at `https://beapoquiz.github.io/kkb/`. There is no backend.

Owner: Bea Juliana Poquiz (github.com/beapoquiz). This is a portfolio project, so quality and polish matter.

## Where things are
- `docs/00-build-prompt.md`: the full build brief and phase order. **Start here.**
- `docs/01`–`07`: detailed specs. The more specific doc wins over the overview.
- `NOTES.md`: your running log (decisions, checklist, skipped items). Create it in Phase 0.

## Golden rules
1. **Money is always integer minor units** (centavos). Never store floats. All splitting logic lives in pure TS in `src/lib/` and is unit-tested.
2. **Simple beats clever** in the UI. When in doubt, fewer taps and fewer options.
3. **Never delete** `CLAUDE.md`, `.claude/`, or `docs/`. Append to this file only.
4. **Shared links are untrusted input**: always validate with Zod before use.
5. **No network calls at runtime**: no analytics, CDNs or external fonts. Everything is bundled.
6. **Accessibility is required**, not optional: labels, focus rings, keyboard use, and AA contrast.
7. Commit after every phase with Conventional Commits (`feat:`, `fix:`, `chore:`, `test:`, `docs:`, `style:`, `refactor:`).
8. **Do not push** to GitHub or create repos without asking Bea first.
9. Bea is on Windows. Keep npm scripts cross-platform.
10. Work continuously. Don't stop to ask questions: decide, log the decision in `NOTES.md`, and move on.

## Commands (update this list once package.json exists)
- `npm install`: install dependencies
- `npm run dev`: start the dev server
- `npm run lint` / `npm run typecheck` / `npm test` / `npm run build` / `npm run preview`
- `npm run test:e2e`: Playwright smoke test

## Code conventions
- TypeScript `strict`, with no `any` and no `@ts-ignore`.
- Function components with hooks. Keep components under ~150 lines and split them when they grow.
- Folder layout: `src/lib` (pure logic), `src/store` (Zustand), `src/components` (shared UI), `src/screens` (routes), `src/mascot` (Plutus SVGs), `src/styles`.
- Names: `PascalCase.tsx` for components, `camelCase.ts` for logic, and tests next to the code as `*.test.ts(x)`.
- User-facing text is English. The one allowed Taglish easter egg is "All settled! Bayad na lahat 🎉".
