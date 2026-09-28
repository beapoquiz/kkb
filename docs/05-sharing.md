# 05 — Sharing: link, QR code and "Who are you?"

There's **no server**. The whole event travels inside the link.

## 1. Link format
```
https://beapoquiz.github.io/kkb/#/s/<payload>
payload = lzString.compressToEncodedURIComponent(JSON.stringify(compactEvent))
```
- `compactEvent` is the `KkbEvent` with **short keys** to keep links small (e.g. `people → p`, `expenses → e`, `payments → y`, `name → n`). Put the mapping in one place (`src/lib/share.ts`) with `toCompact()` / `fromCompact()`, and test the round trip.
- Drop `createdAt` values from items. Keep expense and payment timestamps only as dates to save space.
- Always include `v: 1`. Unknown future versions → the friendly error screen *"This link was made with a newer version of KKB. Refresh the page and try again."*
- Build the base URL from `window.location.origin + import.meta.env.BASE_URL` so it also works in local dev.

## 2. Decoding safely (`decodeShare(payload): Result<KkbEvent, ShareError>`)
1. Payload length > 20,000 chars → reject (`too_large`)
2. Decompress. `null` or an exception → reject (`corrupt`)
3. `JSON.parse` in try/catch → reject (`corrupt`)
4. `fromCompact` → **Zod `safeParse`** with the full schema and limits (30 people, 300 expenses, 300 payments, string lengths, integer amounts, ids referencing existing people) → reject (`invalid`)
5. Recompute everything from the data. **Never trust any totals or balances inside the payload** (and don't include them in it).
6. Render all names as plain text (React escapes by default; never use `dangerouslySetInnerHTML`).

Error screen: sleepy Plutus, the line *"Hmm, this link looks broken. Ask your friend to share it again?"* and a `Go to KKB` button.

## 3. Share sheet (from the event screen)
- Title: *"Share with the barkada"*
- **QR code** (package `qrcode`, `toCanvas` or `toString({type:'svg'})`), error correction `M`, in a white rounded card with a `--blue-soft` border. Plutus (happy, 56px) swims at the top-right corner of the card.
- Buttons:
  - `Copy link`
  - `Share…` (only if `navigator.share` exists): shares `{ title: 'KKB — <event>', text: <summary first 2 lines>, url }`
  - `Download QR`: saves a PNG named `kkb-<event-slug>-qr.png` with the event name printed under the QR code
- **QR size rule:** if the URL is longer than **2,000 characters**, don't show the QR code (phones struggle to scan very dense codes). Instead show a note: *"This split is too big for a QR code. Share the link instead!"*
- **Notes** in caption style at the bottom:
  - *"Links are snapshots: if you add more expenses later, share again."*
  - *"Anyone with this link can see names, amounts and payment handles. Only share it with your group."*

## 4. Opening a shared link (`/s/:payload`)

### 4.1 Intro
- Plutus (happy) + *"You've been invited to split"*
- An event card preview: emoji, name, number of people, total
- Then straight into "Who are you?"

### 4.2 "Who are you?"
- Plutus asks *"Hi! Which one is you?"*
- A grid of big avatar buttons (72px) with names. Each is a `button` with `aria-label="I'm Janna"`.
- A text button below: `I'm just looking`.
- The choice is stored in localStorage `kkb:identity:<eventId> = personId`, so reopening the same link skips this step. A small "Not you? Switch" link lets them change it.

### 4.3 Personal view
- The top hero card changes based on the person's balance:
  - Owes: *"You owe"* + a big amount + *"to Bea"* per transfer where they are the payer, each with the receiver's handle and a copy button. If they owe several people, show one line per transfer.
  - Gets back: *"You'll get back ₱3,718.91"* + the list of who pays them.
  - Even: celebrating Plutus + *"You're all square! 🎉"*
- Below: the read-only Settle up view (balances + all transfers) and the Expenses list (expandable itemized details), so they can check the math.
- Bottom buttons:
  - `Save to my device`: if there's no local event with this ID, save it and go to `/e/:id` (toast "Saved to your device"). If one exists, show a dialog: *"You already have this split. Replace it with the version from this link?"* with `Replace mine` / `Keep mine`. Show "last updated" times for both so they can compare.
  - `Copy my summary`: a short personal text, e.g. *"KKB — Baguio Barkada Trip: I owe Bea ₱2,012.08"*

### 4.4 Mark as paid from a shared link
Allowed only after saving to the device (a read-only view before saving keeps the model simple). The share sheet then produces an updated link to send back.

## 5. Tests
- Round trip: `decode(encode(event))` deep-equals the normalized event (sample trip plus random events from the property generator)
- Rejects: an empty string, random text, a valid compression of invalid JSON, 31 people, a negative amount, an expense whose `paidBy` isn't in `people`, a 20,001-character payload, `v: 2`
- URL length of the sample trip < 2,000 (so the QR code shows). Log the actual length in `NOTES.md`.
