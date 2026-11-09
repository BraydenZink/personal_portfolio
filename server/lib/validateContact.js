const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LIMITS = {
  name: { max: 100 },
  email: { max: 254 },
  message: { min: 10, max: 5000 },
};

const asTrimmedString = (value) => (typeof value === 'string' ? value.trim() : '');

/** Returns cleaned values and a map of field errors, which is empty when the input is valid. */
export function validateContact(body) {
  const values = {
    // Line breaks are removed because the name is used in the email subject.
    name: asTrimmedString(body?.name).replace(/[\r\n]+/g, ' '),
    email: asTrimmedString(body?.email),
    message: asTrimmedString(body?.message),
  };

  const errors = {};

  if (!values.name) errors.name = 'Please enter your name.';
  else if (values.name.length > LIMITS.name.max) errors.name = `Please keep your name under ${LIMITS.name.max} characters.`;

  if (values.email.length > LIMITS.email.max || !EMAIL_PATTERN.test(values.email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (values.message.length < LIMITS.message.min) {
    errors.message = `Please write at least ${LIMITS.message.min} characters.`;
  } else if (values.message.length > LIMITS.message.max) {
    errors.message = `Please keep your message under ${LIMITS.message.max} characters.`;
  }

  return { values, errors };
}
