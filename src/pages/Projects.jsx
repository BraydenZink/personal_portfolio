import { useState } from 'react';
import { AsyncContent, BUTTON_STYLES, Container, Editable, PageHeader } from '../components/ui.jsx';
import { useApi } from '../hooks/useApi.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { isPlaceholder } from '../lib/placeholder.js';

const ALL = 'All';

function ProjectLink({ link }) {
  if (isPlaceholder(link.url)) {
    return <Editable value={link.url} />;
  }
  return (
    <a href={link.url} target="_blank" rel="noreferrer" className={BUTTON_STYLES.secondary}>
      {link.label}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

const PLACEHOLDER_IMAGE = '/images/projects/placeholder.svg';

function ProjectCard({ project }) {
  const hasImage = !isPlaceholder(project.image);
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-ink-800 bg-ink-900">
      <img
        src={hasImage ? project.image : PLACEHOLDER_IMAGE}
        alt={hasImage ? project.imageAlt : 'Placeholder for a project image'}
        width="1200"
        height="750"
        loading="lazy"
        className="aspect-[8/5] w-full border-b border-ink-800 object-cover"
      />
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          <Editable value={project.category} />
        </p>
        <h2 className="mt-3 text-xl font-semibold"><Editable value={project.title} /></h2>
        <p className="mt-3 flex-1"><Editable value={project.description} /></p>

        <h3 className="mt-5 text-sm font-medium text-text-muted">Tools and technology</h3>
        <ul className="mt-2 flex flex-wrap gap-2">
          {project.tools.map((tool) => (
            <li key={tool} className="rounded-full bg-ink-800 px-3 py-1 text-xs text-text-strong">
              <Editable value={tool} />
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {project.links.map((link) => (
            <ProjectLink key={link.label} link={link} />
          ))}
        </div>
      </div>
    </article>
  );
}

function ProjectGallery({ projects }) {
  const [category, setCategory] = useState(ALL);

  // Categories that haven't been filled in yet don't get a filter button.
  const categories = [ALL, ...new Set(projects.map((p) => p.category).filter((c) => !isPlaceholder(c)))];
  const visible = category === ALL ? projects : projects.filter((p) => p.category === category);

  return (
    <>
      <div role="group" aria-label="Filter projects by category" className="flex flex-wrap gap-2">
        {categories.map((name) => (
          <button
            key={name}
            type="button"
            aria-pressed={category === name}
            onClick={() => setCategory(name)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              category === name
                ? 'border-accent bg-accent text-accent-ink'
                : 'border-ink-700 text-text-body hover:border-accent hover:text-accent-strong'
            }`}
          >
            {name}
          </button>
        ))}
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </>
  );
}

export default function Projects() {
  usePageMeta('Projects', 'Selected projects and achievements by Brayden Zink, including the tools used and links to the work.');
  const request = useApi('/api/projects');

  return (
    <>
      <PageHeader
        eyebrow="Projects"
        title="Selected work"
        description="Projects and achievements that show how I plan, build and communicate."
      />
      <Container className="py-12 md:py-16">
        <AsyncContent request={request} label="projects">
          {(projects) => <ProjectGallery projects={projects} />}
        </AsyncContent>
      </Container>
    </>
  );
}
