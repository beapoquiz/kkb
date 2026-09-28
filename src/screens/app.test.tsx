import { screen, waitFor, within } from '@testing-library/react';
import { renderApp } from '../test/renderApp';
import { useKkbStore } from '../store/useKkbStore';

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

const onlyEvent = () => Object.values(useKkbStore.getState().events)[0];

describe('KKB app', () => {
  it('shows the empty home with sleepy Plutus and two actions', () => {
    renderApp('/');
    expect(screen.getByRole('heading', { name: 'KKB', level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/KKB = Kanya-Kanyang Bayad/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'No splits yet' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start a new split' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try a sample trip' })).toBeInTheDocument();
  });

  it('creates an event in two steps and blocks duplicate names', async () => {
    const { user } = renderApp('/new');
    const next = screen.getByRole('button', { name: 'Next' });
    expect(next).toBeDisabled();
    await user.type(screen.getByLabelText('Name'), 'Samgyup Friday');
    await user.click(screen.getByRole('button', { name: 'Drinks' }));
    await user.click(next);

    const input = screen.getByPlaceholderText('Type a name and press Enter');
    for (const name of ['Bea', 'Migs']) await user.type(input, `${name}{Enter}`);
    await user.type(input, 'bea{Enter}');
    expect(screen.getByRole('alert')).toHaveTextContent('Someone named Bea is already here');

    await user.click(screen.getByRole('button', { name: 'Create split' }));
    const event = onlyEvent();
    expect(event).toMatchObject({ name: 'Samgyup Friday', emoji: '🍻', currency: 'PHP' });
    expect(event.people.map((p) => p.name)).toEqual(['Bea', 'Migs']);
    expect(await screen.findByRole('heading', { name: 'Samgyup Friday' })).toBeInTheDocument();
  });

  it('adds an equal expense, then deletes it with undo', async () => {
    const { user } = renderApp('/');
    await user.click(screen.getByRole('button', { name: 'Try a sample trip' }));
    await user.click(screen.getByRole('button', { name: 'Add expense' }));

    const dialog = await screen.findByRole('dialog', { name: 'Add expense' });
    const save = within(dialog).getByRole('button', { name: 'Save' });
    expect(save).toBeDisabled();
    expect(within(dialog).getByText('How much was it?')).toBeInTheDocument();

    await user.type(within(dialog).getByLabelText('Amount in PHP'), '1000');
    await user.type(within(dialog).getByPlaceholderText('What was it for?'), 'Taho');
    expect(within(dialog).getByText('₱250.00 each')).toBeInTheDocument();
    await user.click(save);

    await waitFor(() => expect(onlyEvent().expenses).toHaveLength(5));
    const taho = onlyEvent().expenses[4];
    expect(taho).toMatchObject({ title: 'Taho', mode: 'equal', amount: 100000 });

    await user.click(await screen.findByRole('button', { name: /^Taho, ₱1,000.00/ }));
    const edit = await screen.findByRole('dialog', { name: 'Edit expense' });
    await user.click(within(edit).getByRole('button', { name: 'Delete' }));
    const confirm = await screen.findByRole('alertdialog');
    await user.click(within(confirm).getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(onlyEvent().expenses).toHaveLength(4));

    await user.click(await screen.findByRole('button', { name: 'Undo' }));
    expect(onlyEvent().expenses).toHaveLength(5);
  });

  it('marks a transfer as paid and settles everything', async () => {
    const { user } = renderApp('/');
    await user.click(screen.getByRole('button', { name: 'Try a sample trip' }));
    await user.click(screen.getByRole('tab', { name: 'Settle up' }));

    expect(screen.getByText('gets back ₱3,718.91')).toBeInTheDocument();
    for (let left = 3; left > 0; left--) {
      await waitFor(() =>
        expect(screen.getAllByRole('button', { name: 'Mark as paid' })).toHaveLength(left),
      );
      await user.click(screen.getAllByRole('button', { name: 'Mark as paid' })[0]);
      await user.click(await screen.findByRole('button', { name: 'Yes, paid' }));
    }
    expect(await screen.findByText(/All settled! Bayad na lahat/)).toBeInTheDocument();
    expect(onlyEvent().payments).toHaveLength(4);
  });

  it('blocks removing a person who is part of expenses', async () => {
    const { user } = renderApp('/');
    await user.click(screen.getByRole('button', { name: 'Try a sample trip' }));
    await user.click(screen.getByRole('tab', { name: 'People' }));
    await user.click(screen.getByRole('button', { name: /Migs/ }));
    expect(await screen.findByRole('note')).toHaveTextContent(
      'Migs is part of 3 expenses. Remove them from those first.',
    );
    expect(screen.queryByRole('button', { name: 'Remove Migs' })).toBeNull();
  });

  it('shows a friendly page for unknown routes', () => {
    renderApp('/nope');
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  });
});
