import { ButtonLink, Container } from '../components/ui.jsx';
import { usePageMeta } from '../hooks/usePageMeta.js';

export default function NotFound() {
  usePageMeta('Page not found', 'This page could not be found.');

  return (
    <Container className="py-24 text-center">
      <p className="font-display text-6xl font-bold text-accent">404</p>
      <h1 className="mt-4 text-3xl font-bold">Page not found</h1>
      <p className="mt-4">The page you're looking for doesn't exist or has moved.</p>
      <div className="mt-8">
        <ButtonLink to="/">Back to home</ButtonLink>
      </div>
    </Container>
  );
}
