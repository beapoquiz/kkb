# KKB build notes

Running log for the build: decisions, the phase checklist, and the acceptance checklist.

## Decisions

- **Workspace:** the session started in another repo (`mmpose_thesis`). KKB is built in `Desktop/kkb`, the folder prepared with `CLAUDE.md` + `docs/`.
- **Scaffold:** files were created by hand (no `npm create vite`) so nothing in `docs/` could be touched.
- **Versions:** latest stable at build time: React 19 (brief says "18+"), Vite 8, TypeScript 6, Tailwind 4 (CSS-first `@theme` config, so tokens live in `src/styles/tokens.css` + `index.css` instead of a `tailwind.config.js`), Zod 4, Zustand 5, react-router-dom 7.
- **Extra dev deps:** `fast-check` (property tests, named in docs/04), `@axe-core/playwright` (a11y check, named in docs/07), `@types/*`, `@vitest/coverage-v8` (coverage target in docs/07). Runtime: `lucide-react` (icons, allowed in docs/02).
- **Doc conflicts:** home caption: docs/01 says _"Kanya-Kanyang Bayad · everyone pays their share"_, the build prompt says _"KKB = Kanya-Kanyang Bayad (everyone pays their share)"_. The numbered doc wins, merged with the acronym so non-Filipino visitors still get it: _"KKB = Kanya-Kanyang Bayad · everyone pays their share"_.
- **Discount allocation:** docs/04 §3.3 allocates the discount by item subtotal. KKB allocates it by each person's pre-discount total (items + service + tip) instead. With the original rule, rounding could push a share to −₱0.01 when the discount is close to the whole bill; with this rule a share can never go negative (tested with a 100% discount). The sample fixture has no discount, so its numbers are unaffected.
- **Share format:** inside links, people are referenced by their index in the people array (shorter links, and an out-of-range index is simply invalid). Expense `createdAt` is rebuilt from the date + list position, and payment times are rounded to whole days, as docs/05 asks. `normalizeForShare()` describes exactly what changes, and the round-trip tests compare against it.
- **Summary format:** docs/01 §4 (more specific) wins over the build prompt example (they only differ in sample numbers).

## Phase checklist

- [x] Phase 0: scaffold, CI + deploy workflows
- [x] Phase 1: domain logic + tests
- [x] Phase 2: Zustand store
- [x] Phase 3: screens
- [x] Phase 4: sharing
- [x] Phase 5: Plutus + polish + sample trip
- [x] Phase 6: nice-to-haves (image export, PWA, category chart)
- [x] Phase 7: e2e, screenshots, README, final checks (push waits for Bea)

## Skipped / deferred

- **Demo GIF:** a WebM is recorded instead (`docs/screenshots/demo.webm`). Making a GIF needs ffmpeg, which isn't a project dependency. GitHub doesn't play repo-relative videos inline, so the README links to it.
- **Swipe-left to delete an expense:** replaced by long-press (or right-click) → Edit / Delete, plus Delete inside the edit sheet. Swipe gestures are hard to make keyboard- and screen-reader-accessible, and long-press + the sheet covers both.
- **Celebrating Plutus on "Saved to your device":** saving shows a toast and opens the event instead. A full-screen celebration felt like an extra step before seeing the split.

## Other decisions made during the build

- **Sheets live in the URL** (`?sheet=add`), so the phone's back button closes a sheet instead of leaving the page. This also avoids manual `history.pushState` bugs under React StrictMode.
- **Contrast:** docs/02 lists `mint-strong` on `mint-soft` and `pink-strong` on `pink-soft` as AA-safe, but they measure 4.20:1 and 3.80:1. Pills and hero cards use the soft colors at 40% opacity (4.6–4.8:1) with a ring in the full pastel, so they keep their look and pass AA. No new text colors were added.
- **Mark as paid double-tap guard:** a payment is only recorded if that exact transfer is still outstanding, because a card stays tappable while it animates away.
- **Your view on Settle up:** when you've said who you are for an event, your personal card ("You owe …") appears at the top of Settle up.
- **Lazy loading:** the shared-link screen, QR code, confetti and html-to-image load on demand. Fonts load only the Latin subsets (this covers ñ and other Filipino names).
- **Playwright:** 2 workers locally and a 90 s test timeout. With 5 workers, the main flow (which runs axe 5 times) went past 30 s on this laptop.
- **Category percentages** use the same largest-remainder allocation as the money math, so they always add up to exactly 100%.
- **New dependencies:** `html-to-image` and `vite-plugin-pwa` (both named in the brief for Phase 6).

## Measurements

- Sample trip share URL (on `https://beapoquiz.github.io/kkb/`): **822 characters** (QR limit 2,000).
- `src/lib` coverage after Phase 1: 98.5% lines, 88% branches (89 tests).
- Final `src/lib` coverage: **99.5% lines**, 98.4% statements, 88.7% branches, 100% functions.
- Final tests: **140** Vitest tests in 17 files, and **5** Playwright tests.
- Share link copied from the real share sheet in the browser: **829 characters**.
- Bundle (gzip): initial JS **181.8 KB**, all JS including lazy chunks **203.6 KB** (budget 250 KB). CSS 6.7 KB.
- PWA precache: 26 files, 828 KiB.
- Contrast (WCAG): ink on cream 11.2:1, ink-muted on cream 5.4:1, white on blue-strong 5.3:1, status pills 4.75–4.83:1, hero cards 4.61–4.68:1.

## Acceptance checklist (copied from docs/07)

### Build and code quality

- [x] `npm run lint` passes with 0 errors and 0 warnings
- [x] `npm run typecheck` passes (strict, no `any`, no `@ts-ignore`)
- [x] `npm test` passes, and `src/lib/` has ≥ 90% line coverage (`vitest --coverage`)
- [x] `npm run test:e2e` (Playwright smoke test) passes
- [x] `npm run build` succeeds, and the gzipped JS bundle is ≤ 250 KB (log the real size in NOTES.md)
- [x] `npm run preview` serves correctly under `/kkb/`, and a hard refresh on `#/e/<id>` works
- [x] There are no console errors or warnings in dev or preview
- [x] The git history has one or more Conventional Commits per phase, with no giant "everything" commit
- [x] `CLAUDE.md` commands section updated with the real scripts

### Math (the heart of the app)

- [x] The sample trip reproduces every number in `06-sample-trip.md` exactly
- [x] The property test (≥ 200 random events): Σ balances = 0, settle zeroes everyone, ≤ n − 1 transfers
- [x] No floats are stored anywhere (grep for `parseFloat` / `* 100` in `src/lib`: none, or justified)
- [x] JPY/KRW events show no decimals

### Core flows (check in the browser at 375px wide)

- [x] Empty home → "Try a sample trip" → a sample event with all 3 tabs populated
- [x] Create event → add 4 people → add an equal expense in under 30 seconds of tapping
- [x] Add an itemized expense with 10% service → the preview matches the saved result
- [x] Edit an expense, delete it, and undo the delete
- [x] Mark a transfer as paid → it disappears and balances update → undo it from paid history
- [x] Settle everything → confetti + celebrating Plutus + "All settled! Bayad na lahat 🎉"
- [x] Copy summary → the text matches the format in `01-product-spec.md §4` exactly
- [x] People tab: add a GCash handle → it shows on the transfer card with a working copy button
- [x] Deleting a person used in expenses is blocked with the explanation
- [x] Reload the page → all data is still there (localStorage)

### Sharing

- [x] The share sheet shows a QR code for the sample trip (URL < 2,000 chars) and the link copies
- [x] Open the link in a fresh browser context → "Who are you?" → pick Migs → "You owe ₱31.75 to Bea" with Bea's GCash
- [x] Reopening the same link remembers Migs; "Not you? Switch" works
- [x] Save to device works; opening a second time offers Replace / Keep mine
- [x] Garbage after `#/s/` shows the friendly broken-link screen (no crash, no blank page)
- [x] The QR PNG download works and includes the event name

### Design and accessibility

- [x] It matches the tokens in `02-design-system.md` (no ad-hoc colors in components)
- [x] Plutus renders in all 4 moods, and every mood includes the gold coin scale
- [x] `prefers-reduced-motion` disables floating and confetti
- [x] Every flow can be completed with the keyboard only; focus rings are visible; sheets trap focus and close on Esc
- [x] Every icon-only button has an `aria-label`; avatar chips use `aria-pressed`
- [x] Playwright + `@axe-core/playwright` reports **no serious or critical** violations on Home, Event and Shared view
- [x] Layout checked at 375, 768 and 1280 px with no horizontal scroll, and the desktop view is a centered column

### Portfolio polish

- [x] Screenshots are in `docs/screenshots/` (home, expenses, itemized sheet, settle up, share QR, who-are-you, personal view)
- [x] README: logo, pitch, live demo link, screenshots, "Why KKB?", "Meet Plutus", features, "How settle-up works", "How sharing works with no server", tech stack, run locally, tests, project structure, license
- [x] `LICENSE` (MIT, © 2026 Bea Juliana Poquiz)
- [x] `.github/workflows/ci.yml` and `deploy.yml` exist and are valid YAML
- [x] `index.html` has a title ("KKB — split bills, stay friends"), meta description, theme color `#7CC4F5`, and Open Graph tags (plus an OG image made from Plutus + wordmark, 1200×630)
- [x] A final summary for Bea, plus the push commands, printed at the end, and **nothing pushed** without her OK
