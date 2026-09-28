import { Plus, Share2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { IconButton } from '../../components/Button';
import { SegmentedControl } from '../../components/SegmentedControl';
import { TopBar } from '../../components/TopBar';
import { useSheetParam } from '../../components/useSheetParam';
import { totalSpent } from '../../lib/balances';
import { formatMoney } from '../../lib/money';
import { useKkbStore } from '../../store/useKkbStore';
import { RenameEventSheet } from '../home/RenameEventSheet';
import { NotFoundScreen } from '../NotFoundScreen';
import { ExpenseSheet } from './expense/ExpenseSheet';
import { ExpensesTab } from './ExpensesTab';
import { PeopleTab } from './PeopleTab';
import { PersonSheet } from './PersonSheet';
import { SettleTab } from './settle/SettleTab';
import { ShareSheet } from './share/ShareSheet';

type Tab = 'expenses' | 'settle' | 'people';
const TABS: { value: Tab; label: string }[] = [
  { value: 'expenses', label: 'Expenses' },
  { value: 'settle', label: 'Settle up' },
  { value: 'people', label: 'People' },
];
const isTab = (v: string | undefined): v is Tab => TABS.some((t) => t.value === v);

export function EventScreen() {
  const { eventId = '' } = useParams();
  const navigate = useNavigate();
  const event = useKkbStore((s) => s.events[eventId]);
  const storedTab = useKkbStore((s) => s.lastTab[eventId]);
  const setLastTab = useKkbStore((s) => s.setLastTab);
  const { sheet, params, openSheet, closeSheet } = useSheetParam();

  if (!event) {
    return (
      <NotFoundScreen
        title="Split not found"
        text="I couldn't find this split on your device. It may have been deleted."
      />
    );
  }

  const tab: Tab = isTab(storedTab) ? storedTab : 'expenses';
  const editingId = sheet === 'edit' ? params.get('id') : null;
  const editing = editingId ? event.expenses.find((e) => e.id === editingId) : undefined;
  const count = event.people.length;

  return (
    <main className="flex flex-1 flex-col">
      <TopBar
        onBack={() => navigate('/')}
        backLabel="Back to home"
        actions={
          <IconButton label="Share" onClick={() => openSheet('share')}>
            <Share2 size={22} aria-hidden="true" />
          </IconButton>
        }
      >
        <button
          type="button"
          onClick={() => openSheet('rename')}
          className="squish flex max-w-full items-center gap-2 rounded-2xl px-2 py-1 text-left hover:bg-blue-soft/60"
          aria-label={`Rename ${event.name}`}
        >
          <span aria-hidden="true" className="text-2xl">
            {event.emoji}
          </span>
          <h1 className="truncate font-display text-h2 font-semibold" title={event.name}>
            {event.name}
          </h1>
        </button>
      </TopBar>

      <div className="sticky top-[60px] z-10 bg-cream/95 px-4 pb-3 backdrop-blur">
        <p className="mb-3 px-1 text-caption font-semibold text-ink-muted">
          Total <span className="tabular">{formatMoney(totalSpent(event), event.currency)}</span> ·{' '}
          {count} {count === 1 ? 'person' : 'people'}
        </p>
        <SegmentedControl
          asTabs
          idPrefix="event"
          label="Sections"
          segments={TABS}
          value={tab}
          onChange={(t) => setLastTab(eventId, t)}
        />
      </div>

      <div
        role="tabpanel"
        id={`event-panel-${tab}`}
        aria-labelledby={`event-tab-${tab}`}
        className="flex flex-1 flex-col px-4 pt-2 pb-28"
      >
        {tab === 'expenses' && (
          <ExpensesTab event={event} onEdit={(id) => openSheet('edit', { id })} />
        )}
        {tab === 'settle' && <SettleTab event={event} onShare={() => openSheet('share')} />}
        {tab === 'people' && (
          <PeopleTab
            event={event}
            onEdit={(id) => openSheet('person', { id })}
            onAdd={() => openSheet('person', { id: 'new' })}
          />
        )}
      </div>

      {tab !== 'people' && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-[480px] justify-end px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            aria-label="Add expense"
            onClick={() => openSheet('add')}
            className="squish pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-strong text-white shadow-float hover:brightness-110"
          >
            <Plus size={30} strokeWidth={2.5} aria-hidden="true" />
          </button>
        </div>
      )}

      <ExpenseSheet
        event={event}
        open={sheet === 'add' || Boolean(editing)}
        expense={editing}
        onClose={closeSheet}
      />
      <PersonSheet
        event={event}
        personId={sheet === 'person' ? params.get('id') : null}
        onClose={closeSheet}
      />
      <RenameEventSheet event={sheet === 'rename' ? event : undefined} onClose={closeSheet} />
      <ShareSheet event={event} open={sheet === 'share'} onClose={closeSheet} />
    </main>
  );
}
