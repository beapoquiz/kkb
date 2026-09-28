# 01 — Product spec: screens, flows and copy

> The goal: someone at a restaurant table should be able to open KKB, add a bill, and know who owes whom **in under 60 seconds**, one-handed on a phone.

## 1. Who it's for
- **Primary:** a barkada (friend group, typically 3 to 8 people) on a trip, at dinner or at a party, where one or two people pay and everyone settles up later.
- **Secondary:** friends who receive a shared link or QR code and just want to know "how much do I owe, and to whom?"
- **Portfolio visitors:** recruiters and developers who click the live demo. They must be able to see a full example in one tap ("Try a sample trip").

## 2. Information architecture

```
/                     Home (event list)
/new                  Create event (2 quick steps)
/e/:eventId           Event (tabs: Expenses | Settle up | People)
   └── sheet: Add/Edit expense (Equal | Itemized)
   └── sheet: Share (link + QR)
/s/:data              Opened shared link → "Who are you?" → Personal view
*                     Not found (sleepy Plutus + "Go home")
```
Use a HashRouter, so real URLs look like `https://beapoquiz.github.io/kkb/#/e/abc123`.

## 3. Screens

### 3.1 Home (`/`)
- **Header:** the Plutus logo (small, happy) + the wordmark **KKB**, and below it the caption *"Kanya-Kanyang Bayad · everyone pays their share"*.
- **Event cards**, newest first. Each card shows: the emoji, the event name, the number of people as overlapping avatar bubbles (max 4, then "+2"), the total spent, and a status pill:
  - `All settled ✓` (mint) when all balances are 0 and at least one expense exists
  - `₱X to settle` (pink) otherwise
  - `No expenses yet` (neutral) when empty
- Card actions: tap to open. A "⋯" menu has **Rename**, **Duplicate** and **Delete** (delete asks for confirmation: "Delete 'Baguio Barkada Trip'? This can't be undone." with the buttons `Cancel` / `Delete`).
- A **primary button** at the bottom: `+ New split`.
- **Empty state:** sleepy Plutus, the heading *"No splits yet"*, the text *"Add a trip, a dinner, or a night out, and I'll do the math."*, and the buttons `Start a new split` (primary) and `Try a sample trip` (secondary).
- A small footer: *"Made with 💙 by Bea · Your data stays on this device"*.

### 3.2 Create event (`/new`)
**Step 1: "What are we splitting?"**
- A name input, with the placeholder `e.g. Baguio Trip, Samgyup Friday`. Required, 1–40 characters.
- An emoji picker: a row of 12 choices (🏖️ 🍜 🎉 🏔️ ✈️ 🍻 🎤 🛒 🏠 🎂 🚗 💼), default 🎉.
- A currency select (small, collapsed under "More options"): PHP (default), USD, EUR, JPY, SGD, KRW.
- A `Next` button.

**Step 2: "Who's in?"**
- A single input with the placeholder `Type a name and press Enter`. Each added person appears as an avatar chip with an × to remove.
- Auto-assign avatars: cycle through the animal emoji list 🐱 🐶 🐰 🐻 🐼 🐨 🦊 🐸 🐧 🐹 🦄 🐙 and the pastel color list (see the design system). Tapping an avatar opens a small popover to change the emoji or color.
- Helper text: *"Add yourself too!"*
- Minimum 2 people to continue. Duplicate names (case-insensitive) are blocked with the inline message *"Someone named Bea is already here"*.
- A `Create split` button → goes to the event, Expenses tab.
- Payment handles are **not** asked for here, to keep creation fast. They're added later in the People tab.

### 3.3 Event screen (`/e/:eventId`)
- **Top bar:** a back arrow, the event emoji + name (tap to rename), and a **Share** icon button (aria-label "Share").
- **Summary strip** under the top bar: `Total ₱12,480.00 · 4 people`.
- **Tabs** (sticky segmented control): `Expenses` · `Settle up` · `People`. Remember the last tab per event.
- **Floating action button** `+` (aria-label "Add expense"), visible on the Expenses and Settle up tabs.

#### Expenses tab
- A list grouped by date (Today / Yesterday / "Sep 27"). Each row shows: the category emoji in a pastel circle, the title, *"Migs paid · split 4 ways"* (or *"itemized · 4 people"*), and the amount on the right.
- Tap a row → the Edit expense sheet. Swipe-left or a long-press menu → Delete (with undo).
- **Empty state:** thinking Plutus, *"Nothing here yet"*, *"Tap + to add the first expense."*

#### Settle up tab
1. **"Your view" selector** (only if an identity is set for this event): highlights the chosen person's card at the top.
2. **Balances:** one row per person with the avatar, name and a horizontal bar (mint to the right = gets back, pink to the left = owes, centered at zero), plus the text *"gets back ₱3,718.91"* / *"owes ₱2,012.08"* / *"all square"*.
3. **Transfers:** a heading *"Fewest payments to settle up"* and a card per transfer:
   - `Janna → Bea` with both avatars and an arrow, and the amount in large type
   - If Bea has a payment handle: *"GCash · 0917 000 0001"* with a copy icon ("Copied!" toast)
   - A button `Mark as paid` → a small confirm ("Janna paid Bea ₱2,012.08?" `Yes, paid` / `Cancel`) → the card animates out and a payment is recorded
4. **Paid history** (collapsible): *"✅ Janna paid Bea ₱500.00 · Sep 28"*, with an `Undo` link on each.
5. **All settled state:** celebrating Plutus, a confetti burst (once per transition to settled), *"All settled! Bayad na lahat 🎉"* and *"Everyone's even. Friendship intact."*
6. Action buttons: `Copy summary for group chat` and `Share` (opens the share sheet).
7. **Nice-to-have (Phase 6):** `Save as image` and a category breakdown chart.

#### People tab
- A card per person: avatar, name, and payment handle (or a `+ Add GCash / Maya / bank` link).
- Tapping a person → an edit sheet with name, avatar emoji, avatar color, payment method (GCash / Maya / Bank / Other) and payment value (max 40 chars; helper text *"Only shared with people you send the link to."*).
- `+ Add person` at the bottom (a person added later is simply not part of older expenses).
- Deleting a person who appears in any expense or payment is **blocked**: *"Migs is part of 3 expenses. Remove them from those first."* Deleting an unused person is allowed with a confirmation.

### 3.4 Add / Edit expense sheet
A bottom sheet on mobile and a centered modal (max 480px) on desktop. The order is chosen so the most common path is: amount → title → Save.

1. **Amount**: a huge centered input with the currency symbol, a numeric keyboard (`inputMode="decimal"`), and autofocus. Hidden in itemized mode (the total is computed there).
2. **Title**: placeholder `What was it for?`, max 50 chars. If it's left empty on save, default to the category name (e.g. "Food").
3. **Category chips**: 🍜 Food · 🚕 Transport · 🏠 Stay · 🛒 Groceries · 🎉 Fun · 📦 Other (default Food).
4. **Paid by**: a single-select avatar row. The default is the last payer used in this event, or the first person.
5. **Split between**: a multi-select avatar row with everyone selected by default, plus `All` / `None` quick toggles.
6. **Split method** segmented control: `Equal` | `Itemized`.
   - Equal: a live preview line *"₱740.00 each"* (or *"₱333.34 / ₱333.33 each"* when there's a remainder).
7. **Date**: defaults to today, shown as a small chip; tap to change.
8. Buttons: `Save` (primary; disabled until valid) and `Delete` (edit mode only).

Validation messages (inline, friendly):
- Amount empty or 0: *"How much was it?"*
- No one in "Split between": *"Pick at least one person to split with"*
- Amount over 10,000,000.00: *"That's a lot of money! Max is 10,000,000."*

#### Itemized mode
- The item list. Each row has: name (placeholder `Item`), unit price, quantity stepper (1–99), and a row of mini avatars (tap to toggle who shared it; the default is everyone in "Split between"). The line total is on the right.
- `+ Add item` adds a row and focuses its name.
- **Extras** (collapsed accordion "Service charge, tip, discount"):
  - Service charge %: default 0, with a quick chip `10%` (common in PH restaurants)
  - Tip: a fixed amount
  - Discount: a fixed amount (helper text: *"e.g. senior/PWD discount or promo"*)
- **Live preview card** "Who pays what": each person with their total, plus the grand total. If the user types a receipt total into an optional *"Receipt says"* field, show ✓ when it matches, or *"Off by ₱12.00. Check your items?"* when it doesn't.
- Validation: at least one item; every item needs a price > 0 and at least one person; the discount can't exceed subtotal + service + tip.

### 3.5 Share sheet
See `05-sharing.md`.

### 3.6 Shared link flow (`/s/:data`)
See `05-sharing.md`.

## 4. Group chat summary (exact format)
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
- Omit the handle parentheses when the receiver has no handle.
- Omit the "✅ Paid" lines when there are no payments.
- When everything is settled, replace "To settle up" with `Everyone's even! 🎉`.

## 5. Toasts (bottom, 3–5 seconds, one at a time)
- Expense deleted → *"Expense deleted"* + `Undo` (5 s)
- Copied → *"Copied!"*
- Marked as paid → *"Nice! Janna paid Bea 💸"*
- Saved from a shared link → *"Saved to your device"*

## 6. Edge cases (must be handled)
| Case | Behaviour |
|---|---|
| Event with 1 person | Allowed, but Settle up shows *"Add at least 2 people to split"* |
| An expense where the payer is the only participant | Allowed. It affects nothing; show "(personal)" |
| Long names (> 20 chars) | Truncate with an ellipsis in chips; full name in the title attribute |
| Balances of ±1 centavo from rounding | Can't happen if the math rules are followed. The tests prove it |
| localStorage unavailable (private mode) | The app works in memory and shows a one-time banner: *"Private mode: your splits won't be saved after you close this tab."* |
| Corrupted stored data | Catch the error, back up the raw string under `kkb:backup:<timestamp>`, start fresh, and show a friendly message |
| Browser back button while a sheet is open | Closes the sheet (not the page) |
