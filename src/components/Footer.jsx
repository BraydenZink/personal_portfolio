import { useApi } from '../hooks/useApi.js';
import { isPlaceholder } from '../lib/placeholder.js';

const footerLink = 'transition-colors hover:text-accent-strong';

export default function Footer() {
  const { data: profile } = useApi('/api/profile');
  const showLinkedin = profile?.linkedin && !isPlaceholder(profile.linkedin);

  return (
    <footer className="border-t border-ink-800">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-text-muted sm:flex-row sm:px-6 lg:px-8">
        <p>&copy; {new Date().getFullYear()} Brayden Zink</p>
        <ul className="flex gap-6">
          {showLinkedin && (
            <li>
              <a className={footerLink} href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
            </li>
          )}
          {profile?.resume && (
            <li>
              <a className={footerLink} href={profile.resume} target="_blank" rel="noreferrer">Resume</a>
            </li>
          )}
        </ul>
      </div>
    </footer>
  );
}
