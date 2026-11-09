import { Resend } from 'resend';

const DEFAULT_FROM = 'Portfolio Contact <onboarding@resend.dev>';

export class EmailNotConfiguredError extends Error {}

export async function sendContactEmail({ name, email, message }) {
  const { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } = process.env;

  if (!RESEND_API_KEY || !CONTACT_TO_EMAIL) {
    throw new EmailNotConfiguredError('RESEND_API_KEY and CONTACT_TO_EMAIL must both be set.');
  }

  // The Resend SDK reports failures through `error` instead of throwing.
  const { error } = await new Resend(RESEND_API_KEY).emails.send({
    from: CONTACT_FROM_EMAIL || DEFAULT_FROM,
    to: CONTACT_TO_EMAIL,
    replyTo: email,
    subject: `Portfolio message from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
  });

  if (error) {
    throw new Error(`Resend rejected the message: ${error.message}`);
  }
}
