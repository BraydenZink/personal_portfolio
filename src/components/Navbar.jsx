import { useState } from 'react';
import { Link, NavLink } from 'react-router';

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/projects', label: 'Projects' },
  { to: '/skills', label: 'Skills' },
  { to: '/contact', label: 'Contact' },
];

const linkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-ink-800 text-accent-strong' : 'text-text-body hover:bg-ink-800 hover:text-text-strong'
  }`;

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-800 bg-ink-950/90 backdrop-blur">
      <nav aria-label="Main" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" onClick={close} className="font-display text-lg font-semibold text-text-strong">
            Brayden <span className="text-accent">Zink</span>
          </Link>

          <ul className="hidden gap-1 md:flex">
            {NAV_ITEMS.map(({ to, label }) => (
              <li key={to}>
                <NavLink to={to} end={to === '/'} className={linkClass}>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            className="rounded-md p-2 text-text-strong hover:bg-ink-800 md:hidden"
          >
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {isOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>

        {isOpen && (
          <ul id="mobile-menu" className="flex flex-col gap-1 pb-4 md:hidden">
            {NAV_ITEMS.map(({ to, label }) => (
              <li key={to}>
                <NavLink to={to} end={to === '/'} onClick={close} className={(state) => `block ${linkClass(state)}`}>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </header>
  );
}
