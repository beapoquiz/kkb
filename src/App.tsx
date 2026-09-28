import { lazy, Suspense } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { CreateEventScreen } from './screens/CreateEventScreen';
import { EventScreen } from './screens/event/EventScreen';
import { HomeScreen } from './screens/HomeScreen';
import { NotFoundScreen } from './screens/NotFoundScreen';

const SharedScreen = lazy(() => import('./screens/shared/SharedScreen'));

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/new" element={<CreateEventScreen />} />
      <Route path="/e/:eventId" element={<EventScreen />} />
      <Route
        path="/s/:data"
        element={
          <Suspense fallback={null}>
            <SharedScreen />
          </Suspense>
        }
      />
      <Route path="*" element={<NotFoundScreen />} />
    </Routes>
  );
}

export function App() {
  return (
    <HashRouter>
      <AppShell>
        <AppRoutes />
      </AppShell>
    </HashRouter>
  );
}
