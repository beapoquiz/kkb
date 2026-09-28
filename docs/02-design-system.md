# 02 — Design system: pastel kawaii, but clean

> Mood words: **soft, bubbly, friendly, tidy, underwater calm.** Think "a pastel stationery shop meets a banking app". It should be cute, but you can still trust it with money.

## 1. Color tokens
Define these as CSS variables in `src/styles/tokens.css` and map them into the Tailwind theme (e.g. `bg-cream`, `text-ink`, `bg-pink-soft`).

### Base
| Token | Hex | Use |
|---|---|---|
| `--cream` | `#FFF8F0` | App background |
| `--surface` | `#FFFFFF` | Cards, sheets |
| `--ink` | `#3B3350` | Main text (11.2:1 on cream ✓) |
| `--ink-muted` | `#6B6280` | Secondary text (5.4:1 on cream ✓) |
| `--line` | `#EFE6DC` | Borders, dividers |

### Brand (Plutus blue)
| Token | Hex | Use |
|---|---|---|
| `--blue-soft` | `#CDE9FF` | Tints, selected chips |
| `--blue` | `#7CC4F5` | Plutus body, illustrations, decorative fills |
| `--blue-strong` | `#2B6FA8` | Primary buttons (white text 5.3:1 ✓), links, focus ring |

### Meaning colors
| Token | Hex | Use |
|---|---|---|
| `--mint-soft` | `#BDF0D8` | "Gets back" bars, settled pill |
| `--mint-strong` | `#1E7A52` | "Gets back" text (5.0:1 ✓) |
| `--pink-soft` | `#FFC8DD` | "Owes" bars, to-settle pill, Plutus blush |
| `--pink-strong` | `#B83A64` | "Owes" text, destructive actions (5.2:1 ✓) |
| `--gold` | `#F5C542` | Plutus's coin scale, sparkles |
| `--gold-deep` | `#D9A21B` | Coin outline |

### Avatar pastels (cycle in this order)
`#FFC8DD` pink · `#BDF0D8` mint · `#D9CCFF` lavender · `#FFF1B8` butter · `#CDE9FF` baby blue · `#FFD6C2` peach · `#E3F5B8` pistachio · `#F9D5F5` lilac-pink
The avatar emoji sits on its color in a circle. Text on these pastels is always `--ink`.

**Contrast rule:** pastel colors are for *backgrounds and decoration only*. Text always uses `--ink`, `--ink-muted` or a `*-strong` token. These pairs were checked for WCAG AA. Don't invent new text colors.

## 2. Typography
- **Headings / wordmark / big amounts:** **Fredoka** (weights 500, 600), via `@fontsource/fredoka`
- **Body / UI:** **Nunito** (weights 400, 600, 700), via `@fontsource/nunito`
- Numbers: use `font-variant-numeric: tabular-nums` for amounts in lists so they align.

| Style | Size / line height | Font |
|---|---|---|
| Display (wordmark) | 40 / 44 | Fredoka 600 |
| Amount XL (expense input, transfer card) | 36 / 40 | Fredoka 600 |
| H1 (screen title) | 24 / 30 | Fredoka 600 |
| H2 (section) | 18 / 24 | Fredoka 500 |
| Body | 16 / 24 | Nunito 400 |
| Label / chip | 14 / 20 | Nunito 700 |
| Caption | 13 / 18 | Nunito 600, `--ink-muted` |

Never go below 13px. Inputs must be ≥ 16px so iOS doesn't zoom.

## 3. Spacing, radius, elevation
- **Spacing:** 4px grid. Common values are 8, 12, 16, 20 and 24. The screen gutter is 16px on mobile.
- **Radius:** chips and buttons `9999px` (pill) · cards `24px` · sheets `32px 32px 0 0` · inputs `16px` · avatars are circles.
- **Shadows:**
  - Card: `0 4px 16px rgba(59, 51, 80, 0.06)`
  - Floating (FAB, sheet): `0 12px 32px rgba(59, 51, 80, 0.14)`
  - Pressed: remove the shadow and scale to `0.96`
- **Borders:** 1.5px `--line` on inputs, and `--blue-strong` when focused.

## 4. Layout
- **Mobile-first.** Design at 375×812 first.
- On screens ≥ 640px: center the app column at `max-width: 480px`, with a soft decorative background outside it (a very faint cream-to-baby-blue gradient with a few scattered bubble circles at 5–8% opacity). The app column gets a subtle card shadow.
- Keep the FAB and bottom sheets inside the column, not the viewport edge.
- Respect `env(safe-area-inset-bottom)` for the FAB and sheets.

## 5. Components

### Button
| Variant | Style |
|---|---|
| Primary | `--blue-strong` background, white text, pill, 48px tall, Nunito 700 |
| Secondary | white background, 1.5px `--blue-strong` border, `--blue-strong` text |
| Ghost | no background, `--ink` text, hover `--blue-soft` |
| Danger | `--pink-strong` text (ghost) or background (confirm dialogs only) |
All buttons: `active:scale-[0.96]`, a 150ms transition, and a disabled state at 45% opacity with `cursor-not-allowed`.

### Avatar chip
A 40px circle (28px in mini mode) with the emoji centered on the person's pastel color. Selected: a 3px `--blue-strong` ring, a small ✓ badge bottom-right, and `aria-pressed="true"`. The name goes below it in caption style (truncated). Pops in with a spring scale 0.6 → 1.

### Card
White, radius 24, card shadow, 16–20px padding. Event cards have a 4px top stripe in the event's derived color (hash the ID into the avatar pastels).

### Bottom sheet
Slides up with a spring (Framer Motion), a 40×5 grab handle, a backdrop of `rgba(59,51,80,0.35)`, focus trap, closes on Esc or backdrop click, max height 92vh, and scrolls internally.

### Segmented control (tabs, split method)
A pill track in `--blue-soft`. The selected segment is white with a card shadow and slides between options.

### Toast
An `--ink` background with white text, pill-shaped, bottom center above the FAB, and an optional action link in `--blue-soft`.

### Balance bar
Centered at zero. It fills to the right in `--mint-soft` for positive balances and to the left in `--pink-soft` for negative ones. Width is proportional to the largest absolute balance.

### Status pills
`All settled ✓` (mint-soft bg, mint-strong text) · `₱X to settle` (pink-soft bg, pink-strong text) · `No expenses yet` (line bg, ink-muted text)

## 6. Motion
- Default: 150–250ms, ease-out, with springs for sheets and avatars (`stiffness ~400, damping ~30`).
- Plutus floats slowly (4s loop, 4px vertical) and bubbles rise now and then.
- Confetti uses these colors only: blue, pink, mint, gold and lavender from the tokens.
- **`prefers-reduced-motion: reduce`** → no floating, no confetti (show a static ✨ instead), and sheets fade instead of sliding.

## 7. Iconography
Use **inline SVG icons** (e.g. the `lucide-react` package is OK, and it's tree-shaken) with 2px strokes and rounded ends, sized 20–24px. Emoji are for avatars, categories and event icons only, never for important controls without an `aria-label`.

## 8. Favicon and app icon
Plutus's face on a `--blue-soft` rounded square. Export `favicon.svg`, a 192 and 512 PNG (for the PWA), and an `apple-touch-icon`.
