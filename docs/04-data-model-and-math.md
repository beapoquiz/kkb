# 04 — Data model, money rules and algorithms

Everything here lives in **pure TypeScript** under `src/lib/` (no React). Every rule below needs a unit test.

## 1. Types (define them with Zod in `src/lib/schema.ts` and export `z.infer` types)

```ts
type Id = string;            // nanoid(10), or crypto.randomUUID().slice(0, 10)
type Minor = number;         // integer minor units (centavos). Always Number.isSafeInteger
type CurrencyCode = 'PHP' | 'USD' | 'EUR' | 'JPY' | 'SGD' | 'KRW';

interface Person {
  id: Id;
  name: string;              // 1–30 chars, trimmed
  emoji: string;             // one of the avatar emoji list
  color: string;             // one of the avatar pastel hexes
  payment?: { method: 'GCash' | 'Maya' | 'Bank' | 'Other'; value: string }; // value ≤ 40 chars
}

type Category = 'food' | 'transport' | 'stay' | 'groceries' | 'fun' | 'other';

interface Item {
  id: Id;
  name: string;              // ≤ 40 chars
  unitPrice: Minor;          // > 0
  qty: number;               // integer 1–99
  sharedBy: Id[];            // ≥ 1 person
}

interface ExpenseBase {
  id: Id;
  title: string;             // ≤ 50 chars
  category: Category;
  paidBy: Id;
  date: string;              // ISO date 'YYYY-MM-DD'
  createdAt: number;         // epoch ms
}
interface EqualExpense extends ExpenseBase {
  mode: 'equal';
  amount: Minor;             // > 0
  participants: Id[];        // ≥ 1
}
interface ItemizedExpense extends ExpenseBase {
  mode: 'itemized';
  items: Item[];             // ≥ 1
  serviceChargeBps: number;  // basis points: 1000 = 10%. 0–5000
  tip: Minor;                // ≥ 0
  discount: Minor;           // ≥ 0 and ≤ subtotal + service + tip
}
type Expense = EqualExpense | ItemizedExpense;

interface Payment {          // created by "Mark as paid"
  id: Id;
  from: Id;
  to: Id;
  amount: Minor;             // > 0
  paidAt: number;
}

interface KkbEvent {
  v: 1;                      // schema version
  id: Id;
  name: string;              // 1–40
  emoji: string;
  currency: CurrencyCode;
  people: Person[];          // 1–30. The ORDER of this array is used for tie-breaking everywhere
  expenses: Expense[];       // ≤ 300
  payments: Payment[];       // ≤ 300
  createdAt: number;
  updatedAt: number;
}
```

## 2. Money helpers — `src/lib/money.ts`
- `CURRENCY_DECIMALS = { PHP: 2, USD: 2, EUR: 2, JPY: 0, SGD: 2, KRW: 0 }`
- `parseAmount(input: string, currency): Minor | null`: accepts `"1,200"`, `"1200.5"` and `"₱1,200.50"`; rejects more decimals than the currency allows, negatives and non-numbers. **Parse the string by splitting on the decimal point. Never do `parseFloat(x) * 100`** (float error: `1.005 * 100 = 100.49999…`).
- `formatMoney(minor, currency): string` via `Intl.NumberFormat('en-PH', { style: 'currency', currency })`. Example: `formatMoney(123450, 'PHP')` → `"₱1,234.50"`.
- `MAX_AMOUNT = 10_000_000 * 100` (per expense, in minor units for 2-decimal currencies).

## 3. Splitting — `src/lib/split.ts`

### 3.1 Equal split with remainder
```
splitEqual(total, participantIds, peopleOrder):
  order participants by their index in event.people   ← deterministic
  base = floor(total / n); remainder = total - base * n
  the first `remainder` participants (in that order) get base + 1, the rest get base
```
Example: ₱100.00 among [Bea, Migs, Janna] → 3334, 3333, 3333. The sum is exactly 10000 ✓

### 3.2 Largest remainder allocation
Used to spread service charge, tip and discount in proportion to each person's item subtotal.
```
allocate(amount, weights: Map<Id, Minor>, peopleOrder):
  W = sum(weights)             // if W == 0 → return all zeros (or throw; unreachable if validated)
  for each p: exact = amount * w_p / W
              base_p = floor(exact); frac_p = (amount * w_p) mod W   ← integer math, no floats
  left = amount - sum(base)
  give +1 to the `left` people with the largest frac_p; break ties by people order
```
Use `BigInt` or check `Number.isSafeInteger(amount * w_p)`. At our limits (1e9 × 1e9) the product can exceed 2^53, **so use BigInt inside `allocate`**.

### 3.3 Itemized split
```
for each item: splitEqual(item.unitPrice * item.qty, item.sharedBy) → add to subtotal[p]
subtotal     = Σ subtotal[p]
service      = roundHalfUp(subtotal * serviceChargeBps / 10000)   ← integer math
serviceShare = allocate(service, subtotal[])
tipShare     = allocate(tip, subtotal[])
discShare    = allocate(discount, subtotal[])
owed[p]      = subtotal[p] + serviceShare[p] + tipShare[p] - discShare[p]
total        = subtotal + service + tip - discount     (and Σ owed[p] === total ✓)
```

### 3.4 `expenseShares(expense, people): Map<Id, Minor>`
This returns what each person *consumed* for one expense (equal or itemized). `expenseTotal(expense)` = the sum of those shares.

## 4. Balances — `src/lib/balances.ts`
```
balance[p] = Σ (expenseTotal for expenses paid by p)
           − Σ (share of p across all expenses)
           + Σ (payments sent by p)
           − Σ (payments received by p)
```
- Positive = gets money back. Negative = owes.
- **Invariant:** `Σ balance === 0`, always. Assert it in tests, and in dev builds with `console.assert`.

## 5. Settle up — `src/lib/settle.ts`
```
settle(balances, peopleOrder): Transfer[]   // Transfer = { from, to, amount }
  loop:
    creditors = people with balance > 0, sorted by balance DESC, ties by people order
    debtors   = people with balance < 0, sorted by balance ASC (most negative first), ties by people order
    if none: break
    c = creditors[0]; d = debtors[0]; x = min(balance[c], -balance[d])
    push { from: d, to: c, amount: x }; balance[c] -= x; balance[d] += x
```
- Each round zeroes at least one person, so there are **at most n − 1 transfers**.
- **README note:** finding the true minimum number of transfers is NP-hard (it reduces to splitting people into the most zero-sum groups). The greedy approach is fast, predictable, and optimal or near-optimal for real friend groups. Include a tiny worked example, e.g. A +₱50, B +₱30, C −₱40, D −₱40 → C→A ₱40, D→B ₱30, D→A ₱10 (3 transfers).

## 6. Summary text — `src/lib/summary.ts`
`buildSummary(event, shareUrl): string` produces exactly the format in `01-product-spec.md §4`.

## 7. Required unit tests (minimum)
1. `parseAmount`: valid/invalid inputs, commas, currency symbol, 0-decimal currencies, `"1.005"` rejected for PHP
2. `splitEqual`: exact division, remainders (100/3, 1/4, 2/3), a single participant, order independence of the input array
3. `allocate`: sums exactly, tie-breaking by people order, zero amount, one person, BigInt path with large numbers
4. Itemized: the sample dinner in `06-sample-trip.md` reproduces **exactly** the numbers listed there
5. Balances: the sample trip reproduces the listed balances and `Σ === 0`
6. Settle: the sample trip reproduces the listed transfers; after applying them every balance is 0; transfer count ≤ n − 1
7. Payments: marking a transfer paid removes it from the next `settle()` result
8. **Property test** (use `fast-check` or a seeded random loop, ~200 runs): random events (2–8 people, 1–20 mixed expenses, random payments) → `Σ balance === 0`, every share ≥ 0 (unless there's a discount edge case), settle zeroes everyone, and there are ≤ n − 1 transfers
9. `buildSummary`: snapshot test for the sample trip, the settled state, and no-handle people
