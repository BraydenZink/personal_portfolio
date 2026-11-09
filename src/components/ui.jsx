import { Link } from 'react-router';
import { isPlaceholder, placeholderText } from '../lib/placeholder.js';

const BUTTON_BASE =
  'inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60';

export const BUTTON_STYLES = {
  primary: `${BUTTON_BASE} bg-accent text-accent-ink hover:bg-accent-strong`,
  secondary: `${BUTTON_BASE} border border-ink-700 text-text-strong hover:border-accent hover:text-accent-strong`,
};

export function ButtonLink({ to, variant = 'primary', children }) {
  return (
    <Link to={to} className={BUTTON_STYLES[variant]}>
      {children}
    </Link>
  );
}

export function Container({ className = '', children }) {
  return <div className={`mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

export function PageHeader({ eyebrow, title, description }) {
  return (
    <div className="blueprint-grid border-b border-ink-800">
      <Container className="py-12 md:py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">{eyebrow}</p>
        <h1 className="mt-3 text-4xl font-bold md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-lg">{description}</p>
      </Container>
    </div>
  );
}

/** Shows content from the API, or a clearly marked prompt if it hasn't been filled in yet. */
export function Editable({ value }) {
  if (!isPlaceholder(value)) return value;
  return (
    <span data-placeholder className="rounded border border-dashed border-todo/60 px-1.5 py-0.5 text-[0.9em] font-normal text-todo">
      {placeholderText(value)}
    </span>
  );
}

/** Loading and error handling shared by every page that reads from the API. */
export function AsyncContent({ request, label, children }) {
  const { data, error, retry } = request;

  if (error) {
    return (
      <div role="alert" className="rounded-lg border border-ink-700 bg-ink-900 p-6 text-center">
        <p>Sorry, the {label} couldn't be loaded.</p>
        <button type="button" onClick={retry} className={`${BUTTON_STYLES.secondary} mt-4`}>
          Try again
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <p role="status" className="py-12 text-center text-text-muted">
        Loading {label}&hellip;
      </p>
    );
  }

  return children(data);
}
