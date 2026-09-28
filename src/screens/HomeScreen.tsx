import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { useSheetParam } from '../components/useSheetParam';
import { Plutus } from '../mascot/Plutus';
import { sortedEvents, useKkbStore } from '../store/useKkbStore';
import { EventCard } from './home/EventCard';
import { EventMenuSheet } from './home/EventMenuSheet';
import { RenameEventSheet } from './home/RenameEventSheet';

export function HomeScreen() {
  const events = useKkbStore((s) => s.events);
  const loadSample = useKkbStore((s) => s.loadSample);
  const duplicateEvent = useKkbStore((s) => s.duplicateEvent);
  const deleteEvent = useKkbStore((s) => s.deleteEvent);
  const navigate = useNavigate();
  const { sheet, params, openSheet, closeSheet } = useSheetParam();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const list = sortedEvents(events);
  const menuEvent = sheet === 'menu' ? events[params.get('id') ?? ''] : undefined;
  const renameEvent = sheet === 'rename' ? events[params.get('id') ?? ''] : undefined;
  const deleting = confirmDeleteId ? events[confirmDeleteId] : undefined;

  const trySample = () => navigate(`/e/${loadSample()}`);

  return (
    <main className="flex flex-1 flex-col px-4 pt-6 pb-4">
      <header className="flex items-center gap-3">
        <Plutus mood="happy" size={72} decorative />
        <div>
          <h1 className="font-display text-display font-semibold text-blue-strong">KKB</h1>
          <p className="text-caption text-ink-muted">
            KKB = Kanya-Kanyang Bayad · everyone pays their share
          </p>
        </div>
      </header>

      {list.length === 0 ? (
        <div className="flex flex-1 flex-col justify-center">
          <EmptyState
            mood="sleepy"
            title="No splits yet"
            text="Add a trip, a dinner, or a night out, and I'll do the math."
          >
            <Button onClick={() => navigate('/new')}>Start a new split</Button>
            <Button variant="secondary" onClick={trySample}>
              Try a sample trip
            </Button>
          </EmptyState>
        </div>
      ) : (
        <>
          <h2 className="sr-only">Your splits</h2>
          <ul className="mt-6 flex flex-col gap-3">
            {list.map((event) => (
              <li key={event.id}>
                <EventCard event={event} onMenu={() => openSheet('menu', { id: event.id })} />
              </li>
            ))}
          </ul>
          <div className="sticky bottom-0 mt-auto bg-gradient-to-t from-cream via-cream pt-6 pb-[env(safe-area-inset-bottom)]">
            <Button
              block
              icon={<Plus size={20} aria-hidden="true" />}
              onClick={() => navigate('/new')}
            >
              New split
            </Button>
          </div>
        </>
      )}

      <footer className="mt-6 text-center text-caption text-ink-muted">
        Made with 💙 by Bea · Your data stays on this device
      </footer>

      <EventMenuSheet
        event={menuEvent}
        onClose={closeSheet}
        onRename={(id) => openSheet('rename', { id })}
        onDuplicate={(id) => {
          duplicateEvent(id);
          closeSheet();
        }}
        onDelete={(id) => {
          closeSheet();
          setConfirmDeleteId(id);
        }}
      />
      <RenameEventSheet event={renameEvent} onClose={closeSheet} />
      <ConfirmDialog
        open={Boolean(deleting)}
        title={`Delete “${deleting?.name ?? ''}”?`}
        body="This can't be undone."
        confirmLabel="Delete"
        confirmVariant="danger-solid"
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId) deleteEvent(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
      />
    </main>
  );
}
