import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';

export function NotFoundScreen({
  title = 'Page not found',
  text = "I swam everywhere but couldn't find that page.",
}: {
  title?: string;
  text?: string;
}) {
  const navigate = useNavigate();
  return (
    <main className="flex flex-1 flex-col justify-center">
      <EmptyState mood="sleepy" title={title} text={text} headingLevel={1}>
        <Button onClick={() => navigate('/')}>Go home</Button>
      </EmptyState>
    </main>
  );
}
