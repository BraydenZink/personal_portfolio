import { useEffect } from 'react';

const SITE_NAME = 'Brayden Zink';

/** Sets the browser tab title and the search engine description for the current page. */
export function usePageMeta(title, description) {
  useEffect(() => {
    document.title = `${title} | ${SITE_NAME}`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  }, [title, description]);
}
