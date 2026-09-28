import { render, screen } from '@testing-library/react';
import { Plutus, type PlutusMood } from './Plutus';

const moods: PlutusMood[] = ['happy', 'thinking', 'celebrating', 'sleepy'];

describe('Plutus', () => {
  it.each(moods)('renders the %s mood with a label and his gold coin', (mood) => {
    const { container } = render(<Plutus mood={mood} animated={false} />);
    expect(screen.getByRole('img', { name: `Plutus the fish, ${mood}` })).toBeInTheDocument();
    expect(container.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 200 200');
    expect(container.querySelectorAll('[data-part="coin"]').length).toBeGreaterThanOrEqual(1);
  });

  it('can be decorative', () => {
    const { container } = render(<Plutus decorative animated={false} />);
    expect(screen.queryByRole('img')).toBeNull();
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('uses the requested size', () => {
    const { container } = render(<Plutus size={56} animated={false} />);
    expect(container.querySelector('svg')).toHaveAttribute('width', '56');
  });
});
