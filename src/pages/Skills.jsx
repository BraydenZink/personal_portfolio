import { AsyncContent, Container, Editable, PageHeader } from '../components/ui.jsx';
import { useApi } from '../hooks/useApi.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { isPlaceholder } from '../lib/placeholder.js';

function SkillBar({ skill, levels }) {
  const maxLevel = Object.keys(levels).length;
  const isRated = !isPlaceholder(skill.level);

  return (
    <li>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="font-medium text-text-strong">{skill.name}</span>
        <span className="text-sm text-text-muted">
          {isRated ? levels[skill.level] : <Editable value={skill.level} />}
        </span>
      </div>
      <div
        role="meter"
        aria-label={skill.name}
        aria-valuemin={0}
        aria-valuemax={maxLevel}
        aria-valuenow={isRated ? skill.level : 0}
        aria-valuetext={isRated ? levels[skill.level] : 'Not rated yet'}
        className="mt-2 h-2 overflow-hidden rounded-full bg-ink-700"
      >
        {isRated && (
          <div className="h-full rounded-full bg-accent" style={{ width: `${(skill.level / maxLevel) * 100}%` }} />
        )}
      </div>
    </li>
  );
}

function SkillsContent({ data }) {
  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data.groups.map((group) => (
          <section key={group.title} className="rounded-xl border border-ink-800 bg-ink-900 p-6">
            <h2 className="text-xl font-semibold">{group.title}</h2>
            <ul className="mt-5 space-y-5">
              {group.skills.map((skill) => (
                <SkillBar key={skill.name} skill={skill} levels={data.levels} />
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section aria-labelledby="learning-heading" className="mt-12">
        <h2 id="learning-heading" className="text-2xl font-bold">Currently learning</h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {data.learning.map((item) => (
            <li key={item} className="rounded-full border border-accent/50 px-4 py-2 text-sm text-text-strong">
              <Editable value={item} />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

export default function Skills() {
  usePageMeta('Skills', 'Construction management, software and business skills of Brayden Zink, with proficiency levels.');
  const request = useApi('/api/skills');

  return (
    <>
      <PageHeader
        eyebrow="Skills"
        title="Skills and tools"
        description="What I can do today, how confident I am with each skill and what I'm learning next."
      />
      <Container className="py-12 md:py-16">
        <AsyncContent request={request} label="skills">
          {(data) => <SkillsContent data={data} />}
        </AsyncContent>
      </Container>
    </>
  );
}
