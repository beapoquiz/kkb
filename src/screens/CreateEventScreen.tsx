import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import type { CurrencyCode, EventEmoji } from '../lib/schema';
import { useKkbStore } from '../store/useKkbStore';
import { DetailsStep } from './create/DetailsStep';
import { PeopleStep, type DraftPerson } from './create/PeopleStep';

export interface EventDetails {
  name: string;
  emoji: EventEmoji;
  currency: CurrencyCode;
}

/** Two quick steps: "What are we splitting?" then "Who's in?". */
export function CreateEventScreen() {
  const navigate = useNavigate();
  const createEvent = useKkbStore((s) => s.createEvent);
  const [step, setStep] = useState<1 | 2>(1);
  const [details, setDetails] = useState<EventDetails>({ name: '', emoji: '🎉', currency: 'PHP' });
  const [people, setPeople] = useState<DraftPerson[]>([]);

  const create = () => {
    const id = createEvent({ ...details, people });
    navigate(`/e/${id}`, { replace: true });
  };

  return (
    <main className="flex flex-1 flex-col">
      <TopBar
        onBack={() => (step === 2 ? setStep(1) : navigate('/'))}
        backLabel={step === 2 ? 'Back to details' : 'Back to home'}
      >
        <p className="text-caption font-bold text-ink-muted">Step {step} of 2</p>
      </TopBar>
      <div className="flex flex-1 flex-col px-4 pb-6">
        {step === 1 ? (
          <DetailsStep value={details} onChange={setDetails} onNext={() => setStep(2)} />
        ) : (
          <PeopleStep people={people} onChange={setPeople} onCreate={create} />
        )}
      </div>
    </main>
  );
}
