# 03 — Plutus the mascot

## Who he is
Plutus is Bea's real pet: a little **blue fish**. She named him after **Plutus, the Greek god of wealth**, which makes him the perfect mascot for a money app. In KKB he's the calm friend who does the math so nobody has to feel awkward asking for money.

**Personality:** gentle, a bit smug about being good at math, always rooting for the barkada to stay friends. He speaks in short, friendly lines.

> If `docs/assets/plutus-reference/` has photos, study them for his real colors, fin shape and tail, then **simplify** into the kawaii style below. The drawing must be an original illustration, not a copy of any existing cartoon fish character.

## Design
- **Body:** a chubby, almost round oval (about 1.2 : 1 wide to tall), `--blue` (`#7CC4F5`) with a lighter belly (`#CDE9FF`) and a soft darker outline (`#2B6FA8` at ~40% opacity, 3px stroke, rounded joins).
- **Eyes:** two big glossy dots (`--ink`), each with one small white highlight, placed on the front third of the body.
- **Cheeks:** two soft `--pink-soft` blush ovals below the eyes.
- **Mouth:** a tiny "w" or small curve.
- **Fins:** one small rounded side fin (it flutters in animation) and a small top fin.
- **Tail:** a soft rounded two-lobed tail with a gentle wave.
- **Signature detail:** **one gold coin-shaped scale** on his side (`--gold` fill, `--gold-deep` outline, with a tiny "₱" or star shine). It's his "wealth" mark and must appear in every mood.
- **Bubbles:** 2–3 small circles with white fill and a blue outline, used as decoration.

Build him as React components in `src/mascot/`:
```
src/mascot/
  Plutus.tsx          // <Plutus mood="happy" size={120} animated />
  parts/Body.tsx, Eyes.tsx, Fins.tsx, Tail.tsx, Coin.tsx, Bubbles.tsx
  plutus.test.tsx     // renders every mood, has role="img" + aria-label
```
- Props: `mood: 'happy' | 'thinking' | 'celebrating' | 'sleepy'`, `size?: number` (default 120), `animated?: boolean` (default true, and forced off for reduced motion), `className?`.
- Accessibility: `role="img"` with `aria-label` such as "Plutus the fish, happy". Mark him decorative (`aria-hidden`) when there's text next to him saying the same thing.
- Keep the SVG to one `viewBox="0 0 200 200"` so every mood lines up.

## Moods
| Mood | Face | Extras | Animation | Where |
|---|---|---|---|---|
| `happy` | open dot eyes, smile | 2 bubbles | slow float up and down (4s), tail sway | Home header, "Who are you?", share sheet |
| `thinking` | eyes looking up to one side, small flat mouth | "?" thought bubble, holding a tiny gold coin in his fin | head tilt back and forth | Settle up while debts remain, empty expenses tab |
| `celebrating` | closed happy eyes (^ ^), big open smile | sparkles + gold coins popping around him | a jump with a little spin, then bubbles | All settled, "Saved to your device" |
| `sleepy` | closed curved eyes, small "o" mouth | "z z" bubbles, resting on a small pebble/sand mound | slow breathing scale (1 → 1.03) | Empty home, not found page |

## Lines Plutus says (use these where it makes sense)
- Home empty: *"No splits yet. Add one and I'll do the math!"*
- Who are you?: *"Hi! Which one is you?"*
- Settle up (debts left): *"Just a few payments and everyone's even."*
- All settled: *"All settled! Bayad na lahat 🎉"*
- Invalid link: *"Hmm, this link looks broken. Ask your friend to share it again?"*
- Not found: *"I swam everywhere but couldn't find that page."*

## App icon
His face and the front half of his body, peeking in from the bottom-left of a `--blue-soft` rounded square, with the coin scale visible. Also make a simple one-color outline version for `favicon.svg` if the full one gets muddy at 16px.
