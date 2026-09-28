# 06 — Sample trip (in-app demo and test fixture)

The **"Try a sample trip"** button loads this event. The same data lives in `src/lib/fixtures/sampleTrip.ts` and is imported by the tests. **All expected numbers below were pre-calculated with the rules in `04-data-model-and-math.md`. Your implementation must match them to the centavo.** If it doesn't, the code is wrong, not the fixture. (If you're 100% sure the fixture is wrong, explain why in `NOTES.md` before changing it.)

## Event
- Name: **Baguio Barkada Trip** · Emoji: 🏔️ · Currency: PHP
- Dates: use relative dates (today − 3, − 2, − 1 days) so the demo always looks fresh.

## People (in this order; order matters for tie-breaking)
| # | Name | Emoji | Color | Payment handle |
|---|---|---|---|---|
| 1 | Bea | 🐰 | `#FFC8DD` | GCash · `0917 000 0001` |
| 2 | Migs | 🐻 | `#BDF0D8` | Maya · `0918 000 0002` |
| 3 | Janna | 🦊 | `#D9CCFF` | — |
| 4 | Carlo | 🐼 | `#FFF1B8` | — |

(The phone numbers are obviously fake placeholders on purpose.)

## Expenses
### E1 — "Bus to Baguio" · 🚕 Transport · Equal
Paid by **Migs** · ₱2,960.00 · split between all 4
→ each ₱740.00

### E2 — "Airbnb (2 nights)" · 🏠 Stay · Equal
Paid by **Bea** · ₱7,500.00 · split between all 4
→ each ₱1,875.00

### E3 — "Dinner on Session Road" · 🍜 Food · Itemized · 10% service charge
Paid by **Carlo**

| Item | Unit price | Qty | Shared by | Line total |
|---|---|---|---|---|
| Pinikpikan | ₱450.00 | 1 | Bea, Migs, Janna, Carlo | ₱450.00 |
| Strawberry shake | ₱150.00 | 2 | Bea, Janna | ₱300.00 |
| Beef salpicao | ₱380.00 | 1 | Migs, Carlo | ₱380.00 |
| Plain rice | ₱40.00 | 4 | Bea, Migs, Janna, Carlo | ₱160.00 |
| Ube cheesecake | ₱210.00 | 1 | Janna | ₱210.00 |

Subtotal ₱1,500.00 · Service charge (10%) ₱150.00 · Tip ₱0 · Discount ₱0 · **Total ₱1,650.00**

| Person | Item subtotal | Service share | Owes for dinner |
|---|---|---|---|
| Bea | ₱302.50 | ₱30.25 | **₱332.75** |
| Migs | ₱342.50 | ₱34.25 | **₱376.75** |
| Janna | ₱512.50 | ₱51.25 | **₱563.75** |
| Carlo | ₱342.50 | ₱34.25 | **₱376.75** |
| **Sum** | ₱1,500.00 | ₱150.00 | **₱1,650.00** ✓ |

### E4 — "Strawberry picking" · 🎉 Fun · Equal
Paid by **Janna** · ₱1,000.00 · split between **Bea, Janna, Carlo** (Migs skipped it)
→ Bea ₱333.34 (gets the extra centavo, first in people order), Janna ₱333.33, Carlo ₱333.33

## Payments (already marked as paid)
- P1: **Janna → Bea ₱500.00**

## Expected results
**Total spent:** ₱13,110.00

| Person | Paid for group | Own share | Payments sent | Payments received | **Balance** |
|---|---|---|---|---|---|
| Bea | ₱7,500.00 | ₱3,281.09 | ₱0.00 | ₱500.00 | **+₱3,718.91** |
| Migs | ₱2,960.00 | ₱2,991.75 | ₱0.00 | ₱0.00 | **−₱31.75** |
| Janna | ₱1,000.00 | ₱3,512.08 | ₱500.00 | ₱0.00 | **−₱2,012.08** |
| Carlo | ₱1,650.00 | ₱3,325.08 | ₱0.00 | ₱0.00 | **−₱1,675.08** |
| **Sum** | ₱13,110.00 | ₱13,110.00 | | | **₱0.00** ✓ |

(Balance = paid for group − own share + payments sent − payments received.)

**Expected settle-up transfers (in this exact order):**
1. Janna → Bea **₱2,012.08**
2. Carlo → Bea **₱1,675.08**
3. Migs → Bea **₱31.75**

3 transfers = n − 1 ✓. After marking all three as paid, every balance is ₱0.00 and the "All settled" state appears.

## Fixture in minor units (for tests)
```ts
expectedBalances = { Bea: 371891, Migs: -3175, Janna: -201208, Carlo: -167508 }
expectedTransfers = [
  { from: 'Janna', to: 'Bea', amount: 201208 },
  { from: 'Carlo', to: 'Bea', amount: 167508 },
  { from: 'Migs',  to: 'Bea', amount: 3175 },
]
dinnerShares = { Bea: 33275, Migs: 37675, Janna: 56375, Carlo: 37675 }
strawberryShares = { Bea: 33334, Janna: 33333, Carlo: 33333 }
```
(Use person IDs in the real fixture, and map names → IDs in the test.)
