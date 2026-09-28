import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../App';
import { AppShell } from '../components/AppShell';
import { useToastStore } from '../store/toast';
import { useKkbStore } from '../store/useKkbStore';

/** Renders the whole app at a route, with a fresh store and storage. */
export function renderApp(route = '/') {
  window.localStorage.clear();
  useKkbStore.setState({ events: {}, lastTab: {}, lastPayer: {} });
  useToastStore.setState({ current: null });
  const user = userEvent.setup();
  const utils = render(
    <MemoryRouter initialEntries={[route]}>
      <AppShell>
        <AppRoutes />
      </AppShell>
    </MemoryRouter>,
  );
  return { user, ...utils };
}
