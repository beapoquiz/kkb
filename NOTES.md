# KKB build notes

Running log for the build: decisions, the phase checklist, and the acceptance checklist.

## Decisions

- **Workspace:** the session started in another repo (`mmpose_thesis`). KKB is built in `Desktop/kkb`, the folder prepared with `CLAUDE.md` + `docs/`.
- **Scaffold:** files were created by hand (no `npm create vite`) so nothing in `docs/` could be touched.
- **Versions:** latest stable at build time: React 19 (brief says "18+"), Vite 8, TypeScript 6, Tailwind 4 (CSS-first `@theme` config, so tokens live in `src/styles/tokens.css` + `index.css` instead of a `tailwind.config.js`), Zod 4, Zustand 5, react-router-dom 7.
- **Extra dev deps:** `fast-check` (property tests, named in docs/04), `@axe-core/playwright` (a11y check, named in docs/07), `@types/*`, `@vitest/coverage-v8` (coverage target in docs/07). Runtime: `lucide-react` (icons, allowed in docs/02).
- **Doc conflicts:** home caption: docs/01 says _"Kanya-Kanyang Bayad · everyone pays their share"_, the build prompt says _"KKB = Kanya-Kanyang Bayad (everyone pays their share)"_. The build prompt's version is used because it explains the acronym to non-Filipino visitors, which is the stated goal.
- **Summary format:** docs/01 §4 (more specific) wins over the build prompt example (they only differ in sample numbers).

## Phase checklist

- [x] Phase 0: scaffold, CI + deploy workflows
- [ ] Phase 1: domain logic + tests
- [ ] Phase 2: Zustand store
- [ ] Phase 3: screens
- [ ] Phase 4: sharing
- [ ] Phase 5: Plutus + polish + sample trip
- [ ] Phase 6: nice-to-haves (image export, PWA, category chart)
- [ ] Phase 7: e2e, screenshots, README, final checks

## Skipped / deferred

(none yet)

## Measurements

(filled in as they are measured)

## Acceptance checklist (copied from docs/07)

### Build and code quality

- [ ] `npm run lint` passes with 0 errors and 0 warnings
- [ ] `npm run typecheck` passes (strict, no `any`, no `@ts-ignore`)
- [ ] `npm test` passes, and `src/lib/` has ≥ 90% line coverage (`vitest --coverage`)
- [ ] `npm run test:e2e` (Playwright smoke test) passes
- [ ] `npm run build` succeeds, and the gzipped JS bundle is ≤ 250 KB (log the real size in NOTES.md)
- [ ] `npm run preview` serves correctly under `/kkb/`, and a hard refresh on `#/e/<id>` works
- [ ] There are no console errors or warnings in dev or preview
- [ ] The git history has one or more Conventional Commits per phase, with no giant "everything" commit
- [ ] `CLAUDE.md` commands section updated with the real scripts

### Math (the heart of the app)

- [ ] The sample trip reproduces every number in `06-sample-trip.md` exactly
- [ ] The property test (≥ 200 random events): Σ balances = 0, settle zeroes everyone, ≤ n − 1 transfers
- [ ] No floats are stored anywhere (grep for `parseFloat` / `* 100` in `src/lib`: none, or justified)
- [ ] JPY/KRW events show no decimals

### Core flows (check in the browser at 375px wide)

- [ ] Empty home → "Try a sample trip" → a sample event with all 3 tabs populated
- [ ] Create event → add 4 people → add an equal expense in under 30 seconds of tapping
- [ ] Add an itemized expense with 10% service → the preview matches the saved result
- [ ] Edit an expense, delete it, and undo the delete
- [ ] Mark a transfer as paid → it disappears and balances update → undo it from paid history
- [ ] Settle everything → confetti + celebrating Plutus + "All settled! Bayad na lahat 🎉"
- [ ] Copy summary → the text matches the format in `01-product-spec.md §4` exactly
- [ ] People tab: add a GCash handle → it shows on the transfer card with a working copy button
- [ ] Deleting a person used in expenses is blocked with the explanation
- [ ] Reload the page → all data is still there (localStorage)

### Sharing

- [ ] The share sheet shows a QR code for the sample trip (URL < 2,000 chars) and the link copies
- [ ] Open the link in a fresh browser context → "Who are you?" → pick Migs → "You owe ₱31.75 to Bea" with Bea's GCash
- [ ] Reopening the same link remembers Migs; "Not you? Switch" works
- [ ] Save to device works; opening a second time offers Replace / Keep mine
- [ ] Garbage after `#/s/` shows the friendly broken-link screen (no crash, no blank page)
- [ ] The QR PNG download works and includes the event name

### Design and accessibility

- [ ] It matches the tokens in `02-design-system.md` (no ad-hoc colors in components)
- [ ] Plutus renders in all 4 moods, and every mood includes the gold coin scale
- [ ] `prefers-reduced-motion` disables floating and confetti
- [ ] Every flow can be completed with the keyboard only; focus rings are visible; sheets trap focus and close on Esc
- [ ] Every icon-only button has an `aria-label`; avatar chips use `aria-pressed`
- [ ] Playwright + `@axe-core/playwright` reports **no serious or critical** violations on Home, Event and Shared view
- [ ] Layout checked at 375, 768 and 1280 px with no horizontal scroll, and the desktop view is a centered column

### Portfolio polish

- [ ] Screenshots are in `docs/screenshots/` (home, expenses, itemized sheet, settle up, share QR, who-are-you, personal view)
- [ ] README: logo, pitch, live demo link, screenshots, "Why KKB?", "Meet Plutus", features, "How settle-up works", "How sharing works with no server", tech stack, run locally, tests, project structure, license
- [ ] `LICENSE` (MIT, © 2026 Bea Juliana Poquiz)
- [ ] `.github/workflows/ci.yml` and `deploy.yml` exist and are valid YAML
- [ ] `index.html` has a title ("KKB — split bills, stay friends"), meta description, theme color `#7CC4F5`, and Open Graph tags (plus an OG image made from Plutus + wordmark, 1200×630)
- [ ] A final summary for Bea, plus the push commands, printed at the end, and **nothing pushed** without her OK
