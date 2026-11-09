const MARKER = 'TODO(BRAYDEN)';

/** True for content in server/data that Brayden hasn't filled in yet. */
export const isPlaceholder = (value) => typeof value === 'string' && value.startsWith(MARKER);

/** The readable part of a placeholder, without the marker. */
export const placeholderText = (value) => {
  const text = value.slice(MARKER.length).replace(/^:\s*/, '');
  return `Add ${text}`;
};
