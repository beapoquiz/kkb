import { screen, waitFor } from '@testing-library/react';
import { buildSampleTrip, SAMPLE_IDS } from '../../lib/fixtures/sampleTrip';
import { encodeEvent } from '../../lib/share';
import { getIdentity } from '../../store/identity';
import { useKkbStore } from '../../store/useKkbStore';
import { renderApp } from '../../test/renderApp';

const trip = buildSampleTrip({ eventId: 'shared-trip' });
const route = `/s/${encodeEvent(trip)}`;

describe('shared link', () => {
  it('asks who you are, then shows the personal view', async () => {
    const { user } = renderApp(route);
    expect(
      await screen.findByRole('heading', { name: 'Hi! Which one is you?' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: "I'm Migs" }));

    expect(getIdentity('shared-trip')).toBe(SAMPLE_IDS.migs);
    const hero = screen.getByRole('region', { name: 'What you owe' });
    expect(hero).toHaveTextContent('You owe₱31.75to Bea');
    expect(hero).toHaveTextContent('GCash · 0917 000 0001');
  });

  it('remembers the choice and lets you switch', async () => {
    const { user } = renderApp(route);
    await user.click(await screen.findByRole('button', { name: "I'm Bea" }));
    expect(screen.getByRole('region', { name: 'What you get back' })).toHaveTextContent(
      "You'll get back₱3,718.91",
    );
    await user.click(screen.getByRole('button', { name: 'Not you? Switch' }));
    expect(screen.getByRole('heading', { name: 'Hi! Which one is you?' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: "I'm just looking" }));
    expect(screen.getByRole('heading', { name: 'Just looking' })).toBeInTheDocument();
  });

  it('saves to the device and opens the event', async () => {
    const { user } = renderApp(route);
    await user.click(await screen.findByRole('button', { name: "I'm Janna" }));
    await user.click(screen.getByRole('button', { name: 'Save to my device' }));
    await waitFor(() => expect(useKkbStore.getState().events['shared-trip']).toBeDefined());
    expect(await screen.findByRole('heading', { name: 'Baguio Barkada Trip' })).toBeInTheDocument();
  });

  it('asks before replacing a local copy', async () => {
    const { user } = renderApp(route);
    useKkbStore.getState().importEvent({ ...trip, name: 'My local copy' });
    await user.click(await screen.findByRole('button', { name: "I'm Janna" }));
    await user.click(screen.getByRole('button', { name: 'Save to my device' }));
    expect(await screen.findByRole('alertdialog')).toHaveTextContent(
      'Replace it with the version from this link?',
    );
    await user.click(screen.getByRole('button', { name: 'Replace mine' }));
    await waitFor(() =>
      expect(useKkbStore.getState().events['shared-trip'].name).toBe('Baguio Barkada Trip'),
    );
  });

  it('shows the friendly broken-link screen for garbage', async () => {
    renderApp('/s/this-is-garbage');
    expect(
      await screen.findByRole('heading', { name: "Can't open this split" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/this link looks broken/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go to KKB' })).toBeInTheDocument();
  });
});
