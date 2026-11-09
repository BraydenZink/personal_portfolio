import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { EmailNotConfiguredError } from '../lib/email.js';
import { validateContact } from '../lib/validateContact.js';

const FIFTEEN_MINUTES = 15 * 60 * 1000;

export function createContactRouter({ sendEmail, rateLimit: maxRequests }) {
  const router = Router();

  const limiter = rateLimit({
    windowMs: FIFTEEN_MINUTES,
    limit: maxRequests,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Too many messages. Please try again in a few minutes.' },
  });

  router.post('/contact', limiter, async (req, res) => {
    // Real visitors never see the hidden `website` field. Bots that fill it in get a normal
    // success response, so they have no reason to adapt, but nothing is sent.
    if (req.body?.website) {
      return res.status(200).json({ ok: true });
    }

    const { values, errors } = validateContact(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: 'Please check the highlighted fields.', errors });
    }

    try {
      await sendEmail(values);
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('Contact email failed:', err.message);
      const notConfigured = err instanceof EmailNotConfiguredError;
      return res.status(notConfigured ? 503 : 502).json({
        error: 'Your message could not be sent right now.',
      });
    }
  });

  return router;
}
