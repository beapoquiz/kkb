# 07 — Acceptance checklist

Copy this list into `NOTES.md` and tick each item **only after you have checked it yourself** (by running the command, the test, or a Playwright check). If an item was skipped on purpose, write why.

## Build and code quality
- [ ] `npm run lint` passes with 0 errors and 0 warnings
- [ ] `npm run typecheck` passes (strict, no `any`, no `@ts-ignore`)
- [ ] `npm test` passes, and `src/lib/` has ≥ 90% line coverage (`vitest --coverage`)
- [ ] `npm run test:e2e` (Playwright smoke test) passes
- [ ] `npm run build` succeeds, and the gzipped JS bundle is ≤ 250 KB (log the real size in NOTES.md)
- [ ] `npm run preview` serves correctly under `/kkb/`, and a hard refresh on `#/e/<id>` works
- [ ] There are no console errors or warnings in dev or preview
- [ ] The git history has one or more Conventional Commits per phase, with no giant "everything" commit
- [ ] `CLAUDE.md` commands section updated with the real scripts

## Math (the heart of the app)
- [ ] The sample trip reproduces every number in `06-sample-trip.md` exactly
- [ ] The property test (≥ 200 random events): Σ balances = 0, settle zeroes everyone, ≤ n − 1 transfers
- [ ] No floats are stored anywhere (grep for `parseFloat` / `* 100` in `src/lib`: none, or justified)
- [ ] JPY/KRW events show no decimals

## Core flows (check in the browser at 375px wide)
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

## Sharing
- [ ] The share sheet shows a QR code for the sample trip (URL < 2,000 chars) and the link copies
- [ ] Open the link in a fresh browser context → "Who are you?" → pick Migs → "You owe ₱31.75 to Bea" with Bea's GCash
- [ ] Reopening the same link remembers Migs; "Not you? Switch" works
- [ ] Save to device works; opening a second time offers Replace / Keep mine
- [ ] Garbage after `#/s/` shows the friendly broken-link screen (no crash, no blank page)
- [ ] The QR PNG download works and includes the event name

## Design and accessibility
- [ ] It matches the tokens in `02-design-system.md` (no ad-hoc colors in components)
- [ ] Plutus renders in all 4 moods, and every mood includes the gold coin scale
- [ ] `prefers-reduced-motion` disables floating and confetti
- [ ] Every flow can be completed with the keyboard only; focus rings are visible; sheets trap focus and close on Esc
- [ ] Every icon-only button has an `aria-label`; avatar chips use `aria-pressed`
- [ ] Playwright + `@axe-core/playwright` reports **no serious or critical** violations on Home, Event and Shared view
- [ ] Layout checked at 375, 768 and 1280 px with no horizontal scroll, and the desktop view is a centered column

## Portfolio polish
- [ ] Screenshots are in `docs/screenshots/` (home, expenses, itemized sheet, settle up, share QR, who-are-you, personal view)
- [ ] README: logo, pitch, live demo link, screenshots, "Why KKB?", "Meet Plutus", features, "How settle-up works", "How sharing works with no server", tech stack, run locally, tests, project structure, license
- [ ] `LICENSE` (MIT, © 2026 Bea Juliana Poquiz)
- [ ] `.github/workflows/ci.yml` and `deploy.yml` exist and are valid YAML
- [ ] `index.html` has a title ("KKB — split bills, stay friends"), meta description, theme color `#7CC4F5`, and Open Graph tags (plus an OG image made from Plutus + wordmark, 1200×630)
- [ ] A final summary for Bea, plus the push commands, printed at the end, and **nothing pushed** without her OK
