import { currencySymbol, formatMoney, maxAmount, parseAmount, toInputString } from './money';

describe('parseAmount', () => {
  it.each([
    ['1200', 120000],
    ['1,200', 120000],
    ['1200.5', 120050],
    ['1200.50', 120050],
    ['₱1,200.50', 120050],
    [' 42 ', 4200],
    ['.5', 50],
    ['7.', 700],
    ['0', 0],
    ['0.01', 1],
  ])('parses %j as %i centavos', (input, expected) => {
    expect(parseAmount(input, 'PHP')).toBe(expected);
  });

  it.each(['', '.', 'abc', '-5', '₱-5', '1.005', '1.2.3', '12abc', '1e5', '99999999999999'])(
    'rejects %j',
    (input) => {
      expect(parseAmount(input, 'PHP')).toBeNull();
    },
  );

  it('has no float error on tricky decimals', () => {
    expect(parseAmount('1.01', 'PHP')).toBe(101);
    expect(parseAmount('4.35', 'PHP')).toBe(435);
    expect(parseAmount('1234567.89', 'PHP')).toBe(123456789);
  });

  it('handles 0-decimal currencies', () => {
    expect(parseAmount('¥1,500', 'JPY')).toBe(1500);
    expect(parseAmount('1500', 'KRW')).toBe(1500);
    expect(parseAmount('1500.5', 'JPY')).toBeNull();
  });
});

describe('formatMoney', () => {
  it('formats PHP with two decimals', () => {
    expect(formatMoney(123450, 'PHP')).toBe('₱1,234.50');
    expect(formatMoney(0, 'PHP')).toBe('₱0.00');
  });

  it('formats JPY and KRW with no decimals', () => {
    expect(formatMoney(1500, 'JPY')).toMatch(/^¥\s?1,500$/);
    expect(formatMoney(1500, 'KRW')).toMatch(/^₩\s?1,500$/);
  });

  it('formats negative amounts', () => {
    expect(formatMoney(-3175, 'PHP')).toBe('-₱31.75');
  });
});

describe('money helpers', () => {
  it('returns currency symbols', () => {
    expect(currencySymbol('PHP')).toBe('₱');
    expect(currencySymbol('EUR')).toBe('€');
  });

  it('converts minor units back to input text', () => {
    expect(toInputString(123405, 'PHP')).toBe('1234.05');
    expect(toInputString(1500, 'JPY')).toBe('1500');
  });

  it('scales the max amount to the currency', () => {
    expect(maxAmount('PHP')).toBe(1_000_000_000);
    expect(maxAmount('JPY')).toBe(10_000_000);
  });
});
