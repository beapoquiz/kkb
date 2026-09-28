import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import type { KkbEvent } from '../../lib/schema';
import { decodeShare, type ShareError } from '../../lib/share';
import { useIdentity, VIEWER } from '../../store/identity';
import { PersonalView } from './PersonalView';
import { WhoAreYou } from './WhoAreYou';

const BROKEN = 'Hmm, this link looks broken. Ask your friend to share it again?';
const ERRORS: Record<ShareError, string> = {
  too_large: BROKEN,
  corrupt: BROKEN,
  invalid: BROKEN,
  newer_version: 'This link was made with a newer version of KKB. Refresh the page and try again.',
};

/** `/s/:data`: a split someone shared. Untrusted until decodeShare() validates it. */
export default function SharedScreen() {
  const { data = '' } = useParams();
  const navigate = useNavigate();
  const result = useMemo(() => decodeShare(data), [data]);

  if (!result.ok) {
    return (
      <main className="flex flex-1 flex-col justify-center">
        <EmptyState
          mood="sleepy"
          title="Can't open this split"
          text={ERRORS[result.error]}
          headingLevel={1}
        >
          <Button onClick={() => navigate('/')}>Go to KKB</Button>
        </EmptyState>
      </main>
    );
  }
  return <SharedEvent key={result.event.id} event={result.event} />;
}

function SharedEvent({ event }: { event: KkbEvent }) {
  const [identity, setIdentity] = useIdentity(event.id);
  const known = identity === VIEWER || event.people.some((p) => p.id === identity);
  if (!identity || !known) return <WhoAreYou event={event} onPick={setIdentity} />;
  return <PersonalView event={event} identity={identity} onSwitch={() => setIdentity(null)} />;
}
