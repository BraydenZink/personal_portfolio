import { Link } from 'react-router';
import HeroBlueprint from '../components/HeroBlueprint.jsx';
import { AsyncContent, ButtonLink, Container, Editable } from '../components/ui.jsx';
import { useApi } from '../hooks/useApi.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { isPlaceholder } from '../lib/placeholder.js';

const SECTION_LINKS = [
  { to: '/projects', title: 'Projects', text: 'Selected work and achievements, with the tools behind them.' },
  { to: '/skills', title: 'Skills', text: 'What I can do today and what I am learning next.' },
  { to: '/contact', title: 'Contact', text: 'Send a message or connect with me on LinkedIn.' },
];

function Headshot({ profile }) {
  const hasPhoto = !isPlaceholder(profile.headshot);
  return (
    <div className="relative mx-auto size-56 shrink-0 sm:size-72">
      {/* Corner marks, like crop marks on a drawing sheet */}
      <span className="absolute -left-2 -top-2 size-6 border-l-2 border-t-2 border-accent" />
      <span className="absolute -right-2 -top-2 size-6 border-r-2 border-t-2 border-accent" />
      <span className="absolute -bottom-2 -left-2 size-6 border-b-2 border-l-2 border-accent" />
      <span className="absolute -bottom-2 -right-2 size-6 border-b-2 border-r-2 border-accent" />
      {hasPhoto ? (
        <img
          src={profile.headshot}
          alt={`Portrait of ${profile.name}`}
          width="576"
          height="576"
          className="size-full rounded-lg object-cover"
        />
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-3 rounded-lg bg-ink-900 text-center">
          <span className="font-display text-6xl font-bold text-accent">{profile.initials}</span>
          <span data-placeholder className="text-sm text-todo">Add your headshot</span>
        </div>
      )}
    </div>
  );
}

function Hero({ profile }) {
  return (
    <section className="relative overflow-hidden border-b border-ink-800">
      <div className="blueprint-grid absolute inset-0" />
      <div className="hero-glow absolute inset-0" />
      <HeroBlueprint />
      <Container className="relative grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[1fr_auto]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">{profile.headline}</p>
          <h1 className="mt-4 text-5xl font-bold sm:text-6xl lg:text-7xl">{profile.name}</h1>
          <p className="mt-6 max-w-2xl text-xl text-text-strong sm:text-2xl">{profile.valueProposition}</p>
          <p className="mt-4 max-w-2xl text-lg">{profile.intro}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <ButtonLink to="/projects">View my projects</ButtonLink>
            <ButtonLink to="/contact" variant="secondary">Get in touch</ButtonLink>
          </div>
        </div>
        <Headshot profile={profile} />
      </Container>
    </section>
  );
}

function Pillars({ pillars }) {
  return (
    <section aria-labelledby="pillars-heading" className="py-16 md:py-20">
      <Container>
        <h2 id="pillars-heading" className="text-3xl font-bold md:text-4xl">What I bring</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {pillars.map(({ title, description }) => (
            <article key={title} className="rounded-xl border border-ink-800 bg-ink-900 p-6">
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="mt-3">{description}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Leadership({ items }) {
  return (
    <section aria-labelledby="leadership-heading" className="pb-16 md:pb-20">
      <Container>
        <h2 id="leadership-heading" className="text-3xl font-bold md:text-4xl">Leadership and involvement</h2>
        <ul className="mt-8 grid gap-6 md:grid-cols-2">
          {items.map(({ title, description }) => (
            <li key={title} className="border-l-2 border-accent pl-5">
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2">{description}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function Education({ education }) {
  return (
    <section aria-labelledby="education-heading" className="border-y border-ink-800 bg-ink-900 py-12">
      <Container className="grid gap-6 md:grid-cols-[auto_1fr] md:gap-12">
        <h2 id="education-heading" className="text-2xl font-bold">Education</h2>
        <ul className="grid gap-6 sm:grid-cols-2">
          {education.map(({ school, degree, date }) => (
            <li key={degree} className="border-l-2 border-accent pl-4">
              <p className="font-semibold text-text-strong"><Editable value={degree} /></p>
              <p className="mt-1"><Editable value={school} /></p>
              <p className="mt-1 text-sm text-text-muted"><Editable value={date} /></p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function Explore() {
  return (
    <section aria-labelledby="explore-heading" className="py-16 md:py-20">
      <Container>
        <h2 id="explore-heading" className="text-3xl font-bold md:text-4xl">Explore</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {SECTION_LINKS.map(({ to, title, text }) => (
            <Link
              key={to}
              to={to}
              className="group rounded-xl border border-ink-800 p-6 transition-colors hover:border-accent"
            >
              <h3 className="text-xl font-semibold group-hover:text-accent-strong">
                {title} <span aria-hidden="true">&rarr;</span>
              </h3>
              <p className="mt-3">{text}</p>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

export default function Home() {
  usePageMeta(
    'Construction Project Management',
    'Brayden Zink is a Purdue University graduate student in Business and Technology preparing for a career in construction project management.',
  );
  const request = useApi('/api/profile');

  return (
    <AsyncContent request={request} label="profile">
      {(profile) => (
        <>
          <Hero profile={profile} />
          <Pillars pillars={profile.pillars} />
          <Leadership items={profile.leadership} />
          <Education education={profile.education} />
          <Explore />
        </>
      )}
    </AsyncContent>
  );
}
