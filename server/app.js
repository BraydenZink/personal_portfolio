import { existsSync } from 'node:fs';
import path from 'node:path';
import express from 'express';
import helmet from 'helmet';
import { sendContactEmail } from './lib/email.js';
import { createContactRouter } from './routes/contact.js';
import { createContentRouter } from './routes/content.js';

const distDir = path.resolve(import.meta.dirname, '../dist');
const indexHtml = path.join(distDir, 'index.html');

export function createApp({ sendEmail = sendContactEmail, contactRateLimit = 5 } = {}) {
  const app = express();

  // Cloud Run puts one proxy in front of the app. This gives the rate limiter the visitor's real IP.
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(
    helmet({
      contentSecurityPolicy: {
        // Cloud Run already redirects HTTP to HTTPS, and upgrading would break local HTTP testing.
        directives: { upgradeInsecureRequests: null },
      },
    }),
  );

  app.use('/api', express.json({ limit: '20kb' }));
  app.use('/api', createContentRouter());
  app.use('/api', createContactRouter({ sendEmail, rateLimit: contactRateLimit }));
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.' }));

  // Serve the built React app. Vite serves it during development instead.
  app.use(
    express.static(distDir, {
      setHeaders(res, filePath) {
        const isHashedAsset = filePath.includes(`${path.sep}assets${path.sep}`);
        res.setHeader('Cache-Control', isHashedAsset ? 'public, max-age=31536000, immutable' : 'no-cache');
      },
    }),
  );

  // Page routes such as /projects are handled by React Router, so a page refresh must return index.html.
  // Paths with a file extension are left to 404, so a missing image is a real error.
  app.use((req, res, next) => {
    const isPageRequest = req.method === 'GET' && !path.extname(req.path);
    if (!isPageRequest || !existsSync(indexHtml)) return next();
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(indexHtml);
  });

  app.use((_req, res) => res.status(404).json({ error: 'Not found.' }));

  // Express identifies an error handler by its four arguments, so `_next` must stay.
  app.use((err, _req, res, _next) => {
    const status = err.status ?? err.statusCode ?? 500;
    if (status >= 500) console.error(err);
    const message = status >= 500 ? 'Something went wrong on the server.' : 'The request could not be processed.';
    res.status(status).json({ error: message });
  });

  return app;
}
