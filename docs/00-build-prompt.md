# Build "KKB": a cute bill splitter for barkadas

You are building a complete, portfolio-quality web app from scratch in the `kkb` folder on my Desktop. Work **autonomously and continuously** through every phase below without stopping to ask me questions. When something is ambiguous, pick the simplest sensible option, write it down in `NOTES.md` under "Decisions", and keep going. The only time you should stop and wait for me is the final push to GitHub (see Phase 7).

This project goes on my GitHub profile (github.com/beapoquiz) next to my undergraduate ML thesis, so the code, commit history, tests and README all need to look clean and professional. The app itself must be **aesthetic, cute, and very easy to use**. When choosing between "more features" and "simpler to use", choose simpler.

---

## 0. Your workspace (read this first)

The folder is **not empty**. I've already prepared it with planning docs so you have everything you need:

```
kkb/
├── CLAUDE.md                     ← project memory: rules, commands, conventions (loaded automatically)
├── .claude/settings.json         ← pre-approved commands so you can work without constant prompts
└── docs/
    ├── 00-build-prompt.md        ← this file: the overview and build order
    ├── 01-product-spec.md        ← every screen, flow, button label and piece of UI copy
    ├── 02-design-system.md       ← exact colors, fonts, spacing, radii, shadows, component styles
    ├── 03-plutus-mascot.md       ← how to draw Plutus and his 4 moods
    ├── 04-data-model-and-math.md ← TypeScript types, money rules, algorithms, worked examples
    ├── 05-sharing.md             ← share link format, QR code, "Who are you?", validation limits
    ├── 06-sample-trip.md         ← exact sample data and the expected results (use as test fixtures)
    ├── 07-acceptance-checklist.md← the checklist to verify before you say you're done
    ├── HOW-TO-START.md           ← notes for me (Bea); you can ignore this one
    └── assets/plutus-reference/  ← I may drop photos of my real fish Plutus here
```

How to use them:
1. **Before writing any code**, read `CLAUDE.md` and every file in `docs/` (01 to 07). If there are images in `docs/assets/plutus-reference/`, look at them and let them inspire Plutus's colors and shape, while keeping him a simple, original kawaii drawing.
2. This prompt gives the overview and the build order. The numbered docs give the details. **If they disagree, the more specific numbered doc wins.** Record the conflict in `NOTES.md`.
3. **Scaffolding in a non-empty folder:** `npm create vite` may refuse or offer to delete files. Never let it delete anything. Scaffold into a temporary subfolder (e.g. `_scaffold/`), move the generated files up into the project root, then remove the temporary folder. Alternatively, create the files by hand.
4. **Never delete or overwrite** `CLAUDE.md`, `.claude/`, or anything in `docs/`. You may *append* to `CLAUDE.md` (e.g. real commands once they exist). Keep `docs/` in the final repo, because it shows my planning process.
5. Use `docs/06-sample-trip.md` for the in-app sample trip **and** as unit-test fixtures. The expected balances and transfers in it were calculated in advance, so your code must reproduce them exactly.
6. At the end, work through `docs/07-acceptance-checklist.md` item by item and tick every box in a copy inside `NOTES.md`.
7. I'm on **Windows**. Use cross-platform npm scripts (no `rm -rf` or bash-only syntax in `package.json`; use packages like `rimraf` if needed).

---

## 1. The product

**KKB** helps a group of friends split shared expenses from a trip, dinner or night out, then settle up with the fewest possible transfers.

**The name:** KKB stands for *"Kanya-Kanyang Bayad"*, the Filipino phrase every barkada uses when everyone pays their own share. Tagline: **"Kanya-Kanyang Bayad, made easy."** On the home screen, under the logo, show a small caption: *"KKB = Kanya-Kanyang Bayad (everyone pays their share)"*, so non-Filipino visitors get the joke.

**Mascot:** "Plutus", a small, round, **cute blue fish**. He's named after my real pet fish, a little blue fish called Plutus, who in turn is named after the Greek god of wealth. Design: a chubby, rounded baby-blue body, big shiny dot eyes, pink blush cheeks, small fluttery fins, a soft wavy tail, and **one gold coin-shaped scale** on his side as his money detail. Draw him yourself as inline SVG React components in the pastel kawaii style. He must be an **original design**, not based on any existing character. Make 4 moods, each with a matching idle animation (a gentle float/bob, plus a few rising bubbles when active):
- `happy` (default): a smile and a slow float
- `thinking` (while there are unsettled debts): a tilted head, a small "?" bubble, and a tiny calculator or coin held in one fin
- `celebrating` (everything settled): a jump with sparkles and bubbles
- `sleepy` (empty states): closed eyes and a "z" bubble, resting on a bit of sand or a pebble

**Language:** English only. Default currency is PHP (₱), and each event can pick another currency from a short list (PHP, USD, EUR, JPY, SGD, KRW).

### Core user flow (it must be this simple)
1. The home screen lists my events as cute cards. The empty state shows sleepy Plutus and two buttons: **"Start a new split"** and **"Try a sample trip"**.
2. **Create event:** a name, an emoji (from a small picker), and a currency. Then add people: type a name and press Enter, and each person automatically gets a pastel color and an animal emoji avatar (both can be changed with a tap). Each person can optionally have a **payment handle** (method: GCash / Maya / Bank / Other, plus a value such as a number or account).
3. **Inside an event**, show 3 tabs: **Expenses**, **Settle up**, **People**. A floating "+" button adds an expense.
4. **Add expense** opens a bottom sheet (a modal on desktop):
   - A big amount input, a title, and a category chip (🍜 Food, 🚕 Transport, 🏠 Stay, 🛒 Groceries, 🎉 Fun, 📦 Other)
   - **Paid by:** a single-select row of avatar chips
   - **Split between:** a multi-select row of avatar chips, with everyone selected by default
   - **Split method:** Equal (default) or **Itemized receipt** (see below)
   - Save. Deleting an expense shows an **undo** toast for 5 seconds.
5. **Settle up tab:**
   - Each person's net balance ("Bea gets back ₱850", "Migs owes ₱420"), with a soft green/pink bar visualization
   - The **minimum list of transfers**, as cards reading "Migs → Bea ₱420". Each card shows the receiver's payment handle with a copy button, plus a **"Mark as paid"** button.
   - Marking a transfer as paid records a payment, animates the card away, and updates the balances. When everything is settled, show **confetti** and celebrating Plutus with the message "All settled! Bayad na lahat 🎉" (this one Taglish phrase is allowed as a cute easter egg).
   - A **"Copy summary for group chat"** button (format below)
6. **Share:** see section 3.

### Itemized receipt mode
For restaurant bills where not everyone ate everything:
- Add line items (name, unit price, quantity). For each item, tap the avatars of the people who shared it (default: everyone in "Split between").
- Optional **service charge %** (Philippine restaurants usually charge 10%), optional **tip** (a fixed amount), and optional **discount** (a fixed amount, e.g. a senior/PWD discount or a promo).
- Each person pays their item subtotal plus their proportional share of service charge and tip, minus their proportional share of the discount.
- Show a live "who pays what" preview inside the sheet before saving, plus a check that the computed total matches the receipt total.

### Group chat summary format (plain text, copied to the clipboard)
```
🐟 KKB — Baguio Barkada Trip
Total spent: ₱13,110.00 (4 people)

To settle up:
• Janna → Bea: ₱2,012.08 (GCash 0917 000 0001)
• Carlo → Bea: ₱1,675.08 (GCash 0917 000 0001)
• Migs → Bea: ₱31.75 (GCash 0917 000 0001)
✅ Paid: Janna → Bea ₱500.00

Open the full breakdown: <share link>
```

---

## 2. Money and algorithm rules (these must be correct and tested)

- **Store all money as integer minor units** (centavos). Never use floats for stored amounts. Format with `Intl.NumberFormat` using the event currency (JPY and KRW have 0 decimal places).
- **Equal split with remainders:** divide into integer shares and give the leftover centavos one at a time to participants in a deterministic order (by participant list order), so the shares always add up exactly to the total.
- **Itemized split:** compute per-person item subtotals, then allocate service charge, tip and discount proportionally using the **largest remainder method**, so every allocation adds up exactly.
- **Balances:** `balance = total paid for others − total owed + payments sent − payments received`. The sum of all balances must always be exactly 0 (assert this in tests).
- **Settle-up algorithm:** greedy matching of the largest debtor with the largest creditor, repeated until everyone is at 0. This gives at most n−1 transfers. Explain in the README that finding the true minimum number of transfers is NP-hard, why greedy is a good practical choice here, and give a small example.
- All of this logic lives in **pure TypeScript modules** in `src/lib/` with no React imports, so it's easy to test.

---

## 3. Sharing: link, QR code and "Who are you?"

There is no backend. Sharing works by **encoding the whole event in the URL**.

- Serialize the event → validate it → compress it with `lz-string` (`compressToEncodedURIComponent`) → put it in the URL hash: `https://beapoquiz.github.io/kkb/#/s/<data>`. Include a `v: 1` schema version field.
- The **Share** button opens a sheet with:
  - A **QR code** of the link (use the `qrcode` npm package and render it as SVG or canvas in a pastel frame, with Plutus swimming around the corner)
  - **Copy link**, **Download QR as PNG**, and a native **Share** button (Web Share API when available)
  - If the link is too long for a reliable QR code (roughly > 2,000 characters), hide the QR code and show a friendly note suggesting the link instead
- **Opening a shared link:**
  1. Decode it and validate it with **Zod** (treat it as untrusted input: enforce max lengths, max 30 people, max 300 expenses, and reject anything malformed with a cute error screen).
  2. Show a **"Who are you?"** screen: Plutus asks "Hi! Which one is you?" with a tappable avatar for each person, plus a "Just looking" option.
  3. Show a **personal view** for the chosen person: a big card saying "You owe Bea ₱420" (with her payment handle and a copy button) or "Bea owes you ₱420", then the full breakdown below it.
  4. Offer **"Save to my device"**. If an event with the same ID already exists locally, offer "Update my copy" (replace) or "Keep mine".
- Remember the chosen identity per event in localStorage so returning to the event highlights "you".
- Clearly state in the UI's share sheet and in the README: *links are snapshots. Changes don't sync live, so re-share after updates.* Also note that payment handles are included in the link, so only share it with your group.

---

## 4. Tech stack (use exactly this)

- **Vite + React 18+ + TypeScript** with `strict: true`
- **Tailwind CSS** for styling. Put design tokens (colors, radii, shadows) in the Tailwind theme/CSS variables.
- **Zustand** with the `persist` middleware (localStorage) for state. Wrap storage access in try/catch, and make the app still work if storage is unavailable.
- **Zod** for schemas (a single source of truth for types via `z.infer`)
- **lz-string**, **qrcode**, and **canvas-confetti**
- **Framer Motion** for gentle animations (sheet slide-up, card removal, Plutus bounce). Respect `prefers-reduced-motion`.
- Routing: **HashRouter** from `react-router-dom` (works on GitHub Pages without 404 hacks). Routes: `/`, `/e/:eventId`, `/s/:data`.
- Fonts: self-host with `@fontsource` (e.g. **Nunito** for body text, **Fredoka** for headings). No external CDN calls, analytics or trackers of any kind.
- **Vitest + React Testing Library** for tests, and **Playwright** for one end-to-end smoke test
- **ESLint + Prettier**
- Set Vite `base` to `/kkb/` for GitHub Pages.

---

## 5. Design: pastel kawaii, but clean

- **Palette:** a cream background (`#FFF8F0`-ish), with pastel pink, mint, lavender, butter yellow and baby blue for avatars and accents. Text must stay dark enough to pass **WCAG AA contrast** (check it; pastels on cream often fail).
- Rounded everything (`rounded-2xl`/`3xl`), soft shadows, generous padding, and chunky, friendly buttons.
- **Mobile-first:** it must feel great at 375px wide (most people will open it on their phones from the group chat), and on desktop center it as a phone-width column (max ~480px) with a subtle decorative background.
- Micro-interactions: buttons squish slightly on press, avatars pop in when added, and the Plutus mascot reacts to state.
- Empty states always feature Plutus plus one clear next action.
- **Accessibility:** every interactive element is keyboard-reachable with visible focus rings, avatar chips have `aria-pressed`, the sheets trap focus and close on Esc, amounts are announced properly, and there are no emoji-only buttons without labels.
- Optional dark mode is **not** required. Skip it.

---

## 6. Build phases (commit after each one with a Conventional Commit message)

Keep a running checklist in `NOTES.md` and tick items off as you go.

**Phase 0: Scaffold.** `git init`, Vite React-TS, Tailwind, ESLint/Prettier, Vitest, folder structure, and a placeholder page. Add a GitHub Actions workflow `.github/workflows/ci.yml` (install → lint → typecheck → test → build) and `.github/workflows/deploy.yml` (build and deploy to GitHub Pages on push to `main`, using `actions/upload-pages-artifact` + `actions/deploy-pages`). Commit: `chore: scaffold project`.

**Phase 1: Domain logic plus tests.** `src/lib/money.ts`, `split.ts` (equal plus itemized), `balances.ts`, `settle.ts`, `share.ts` (encode/decode plus validation), `summary.ts` (group chat text), and `schema.ts` (Zod). Write thorough unit tests *first or alongside*: remainder distribution, itemized receipts with service charge/tip/discount, balances always summing to zero, settle-up producing ≤ n−1 transfers that fully zero out balances, payments reducing balances, 0-decimal currencies, share round-trips, and rejection of malformed or oversized share data. Add a property-style test that generates ~200 random events and asserts the invariants. Commit: `feat: core splitting and settle-up logic`.

**Phase 2: State.** A Zustand store with actions for events, people, expenses, payments, delete with undo, sample trip loading, and import from share. Include persistence and a migration hook keyed on the schema version. Commit.

**Phase 3: Screens.** Home, create event, event (3 tabs), the add/edit expense sheet including itemized mode, and the settle-up view with mark-as-paid, confetti and the copy summary. Commit per screen or feature group.

**Phase 4: Sharing.** The share sheet with QR code, the shared link route, "Who are you?", the personal view, and save/update to device. Commit.

**Phase 5: Plutus and polish.** Mascot SVG moods, animations, empty states, toasts, responsive checks at 375 / 768 / 1280, and an accessibility pass. Add the **sample trip** exactly as specified in `docs/06-sample-trip.md` ("Baguio Barkada Trip", 4 friends: Bea, Migs, Janna, Carlo, with equal and itemized expenses, a 10% service charge dinner, and one payment already marked as paid). Commit.

**Phase 6: Nice-to-haves (only after everything above works and passes tests).** In priority order:
1. **"Save summary as image"**: render the settle-up summary card as a cute PNG (with `html-to-image`) for posting in group chats
2. **PWA**: `vite-plugin-pwa` with a manifest, a Plutus app icon, and offline support, so it can be installed on a phone home screen
3. An **expense breakdown by category** as a simple pastel donut or bar chart on the Settle up tab

**Phase 7: README, screenshots and ship.**
- Run the Playwright smoke test: load the sample trip → add an equal expense → add an itemized expense → mark a transfer as paid → open the share sheet → open the share link in a new page → pick "Migs" → see the personal view.
- Use Playwright to capture **screenshots** into `docs/screenshots/` (home, event expenses, itemized sheet, settle up, share QR, "Who are you?", personal view) at mobile size, plus one short **GIF or WebM** of the main flow if feasible.
- Write a strong `README.md`: a centered Plutus logo and title, a short "Why KKB?" section explaining *Kanya-Kanyang Bayad*, a "Meet Plutus" section (the mascot is based on my real blue pet fish Plutus, named after the Greek god of wealth), a one-line pitch, a **Live demo** link (`https://beapoquiz.github.io/kkb/`), a screenshot row, features, a "How settle-up works" section (the algorithm, the NP-hard note, and a worked example), a "How sharing works with no server" section (URL + compression + QR + privacy note), the tech stack, running locally, running tests, the project structure, and an MIT license. Add `LICENSE` (MIT, © 2026 Bea Juliana Poquiz).
- Final checks: `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` must all pass with zero errors and zero TypeScript `any` escapes. Run `npm run preview` and confirm that the `/kkb/` base path works.
- **Then STOP and ask me** before anything touches GitHub. Show me a short summary of what was built, and the exact commands to create the public repo `beapoquiz/kkb`, push `main`, and enable Pages (Settings → Pages → Source: GitHub Actions). If the `gh` CLI is installed and authenticated, offer to run them for me after I confirm.

---

## 7. Quality bar and guardrails

- Keep components small and readable, with sensible folders: `src/lib`, `src/store`, `src/components`, `src/screens`, `src/mascot`.
- Aim for no dependencies beyond those listed, unless there's a clear reason (record it in `NOTES.md`).
- Never lose user data silently: confirm before deleting an event, and use undo for expenses.
- Handle edge cases gracefully: an event with 1 person, an expense with 0 participants (block saving), deleting a person who has expenses (block it with an explanation, or offer to reassign), very long names (truncate), and a ₱0 or negative amount (block it).
- Don't over-engineer: no backend, no accounts, no i18n framework, no global theming system beyond Tailwind tokens.
- If you get stuck on a nice-to-have for more than a couple of attempts, skip it, note it in `NOTES.md`, and move on.
- Before finishing, re-read this whole prompt and verify every requirement against the app, fixing any gaps.
