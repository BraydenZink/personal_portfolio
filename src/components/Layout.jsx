import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import Footer from './Footer.jsx';
import Navbar from './Navbar.jsx';

export default function Layout() {
  const { pathname } = useLocation();

  // React Router keeps the scroll position between pages, so each new page is moved to the top.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div className="flex min-h-svh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:font-semibold focus:text-accent-ink"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
