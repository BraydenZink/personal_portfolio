import { useCallback, useEffect, useState } from 'react';

// Requests are shared so the footer and a page asking for the same data make only one call.
const requests = new Map();

function fetchOnce(path) {
  if (!requests.has(path)) {
    const request = fetch(path).then((response) => {
      if (!response.ok) throw new Error(`Request to ${path} failed with status ${response.status}`);
      return response.json();
    });
    // A failed request is forgotten so that retrying sends a new one.
    request.catch(() => requests.delete(path));
    requests.set(path, request);
  }
  return requests.get(path);
}

/** Loads JSON from the API and reports `{ data, error, retry }`. No data and no error means loading. */
export function useApi(path) {
  const [state, setState] = useState({ data: null, error: false });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    fetchOnce(path)
      .then((data) => isCurrent && setState({ data, error: false }))
      .catch(() => isCurrent && setState({ data: null, error: true }));
    return () => {
      isCurrent = false;
    };
  }, [path, attempt]);

  const retry = useCallback(() => {
    setState({ data: null, error: false });
    setAttempt((value) => value + 1);
  }, []);

  return { ...state, retry };
}
