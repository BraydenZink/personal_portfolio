import { useState } from 'react';
import { AsyncContent, BUTTON_STYLES, Container, Editable, PageHeader } from '../components/ui.jsx';
import { useApi } from '../hooks/useApi.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { isPlaceholder } from '../lib/placeholder.js';

const EMPTY_FORM = { name: '', email: '', message: '', website: '' };
const INPUT_CLASS =
  'mt-2 w-full rounded-lg border border-ink-700 bg-ink-950 px-4 py-3 text-text-strong aria-invalid:border-danger';

function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-text-strong">{label}</label>
      {children}
      {error && <p id={`${id}-error`} className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
}

function ContactForm({ linkedin }) {
  const [values, setValues] = useState(EMPTY_FORM);
  const [status, setStatus] = useState('idle'); // idle | sending | sent | failed
  const [failure, setFailure] = useState({ message: '', fields: {} });

  const update = ({ target }) => setValues((current) => ({ ...current, [target.name]: target.value }));

  const fieldProps = (name) => ({
    id: name,
    name,
    value: values[name],
    onChange: update,
    'aria-invalid': Boolean(failure.fields[name]),
    'aria-describedby': failure.fields[name] ? `${name}-error` : undefined,
    className: INPUT_CLASS,
  });

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus('sending');
    setFailure({ message: '', fields: {} });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const result = await response.json().catch(() => ({}));

      if (response.ok) {
        setValues(EMPTY_FORM);
        setStatus('sent');
        return;
      }
      setFailure({
        message: result.error ?? 'Your message could not be sent right now.',
        fields: result.errors ?? {},
      });
    } catch {
      setFailure({ message: 'Your message could not be sent. Please check your connection.', fields: {} });
    }
    setStatus('failed');
  }

  // A problem with the visitor's input can be fixed in the form, so the fallback is only for other failures.
  const showLinkedinFallback =
    status === 'failed' && Object.keys(failure.fields).length === 0 && linkedin && !isPlaceholder(linkedin);

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5 rounded-xl border border-ink-800 bg-ink-900 p-6 sm:p-8">
      <Field id="name" label="Name" error={failure.fields.name}>
        <input type="text" autoComplete="name" {...fieldProps('name')} />
      </Field>
      <Field id="email" label="Email" error={failure.fields.email}>
        <input type="email" autoComplete="email" {...fieldProps('email')} />
      </Field>
      <Field id="message" label="Message" error={failure.fields.message}>
        <textarea rows="6" {...fieldProps('message')} />
      </Field>

      {/* Spam trap: hidden from visitors, but bots tend to fill it in. */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" value={values.website} onChange={update} />
      </div>

      <button type="submit" disabled={status === 'sending'} className={`${BUTTON_STYLES.primary} w-full sm:w-auto`}>
        {status === 'sending' ? 'Sending…' : 'Send message'}
      </button>

      {status === 'sent' && (
        <p role="status" className="font-medium text-accent-strong">Thanks! Your message was sent.</p>
      )}
      {status === 'failed' && (
        <p role="alert" className="text-danger">
          {failure.message}
          {showLinkedinFallback && (
            <> Please message me on <a className="underline" href={linkedin} target="_blank" rel="noreferrer">LinkedIn</a>.</>
          )}
        </p>
      )}
    </form>
  );
}

function ContactDetail({ label, value, href }) {
  return (
    <div>
      <dt className="text-sm text-text-muted">{label}</dt>
      <dd className="mt-1 break-words font-medium text-text-strong">
        {isPlaceholder(value) ? (
          <Editable value={value} />
        ) : (
          <a className="text-accent-strong underline-offset-4 hover:underline" href={href} target={label === 'LinkedIn' ? '_blank' : undefined} rel="noreferrer">
            {value}
          </a>
        )}
      </dd>
    </div>
  );
}

function ContactContent({ profile }) {
  return (
    <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
      <ContactForm linkedin={profile.linkedin} />
      <aside aria-label="Contact details">
        <h2 className="text-2xl font-bold">Reach me directly</h2>
        <dl className="mt-6 space-y-5">
          <ContactDetail label="LinkedIn" value={profile.linkedin} href={profile.linkedin} />
          {profile.resume && <ContactDetail label="Resume" value="Download PDF" href={profile.resume} />}
        </dl>
      </aside>
    </div>
  );
}

export default function Contact() {
  usePageMeta('Contact', 'Send Brayden Zink a message or connect on LinkedIn.');
  const request = useApi('/api/profile');

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Let's talk"
        description="I'd be glad to hear about construction project management opportunities or answer questions about my work."
      />
      <Container className="py-12 md:py-16">
        <AsyncContent request={request} label="contact details">
          {(profile) => <ContactContent profile={profile} />}
        </AsyncContent>
      </Container>
    </>
  );
}
