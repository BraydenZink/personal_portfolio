import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { Router } from 'express';

const dataDir = path.resolve(import.meta.dirname, '../data');

// Each endpoint returns one file from server/data, read on every request so edits appear on refresh.
const CONTENT_FILES = {
  '/profile': 'profile.json',
  '/projects': 'projects.json',
  '/skills': 'skills.json',
};

export function createContentRouter() {
  const router = Router();

  for (const [route, file] of Object.entries(CONTENT_FILES)) {
    router.get(route, async (_req, res) => {
      const json = await readFile(path.join(dataDir, file), 'utf8');
      res.setHeader('Cache-Control', 'no-cache');
      res.type('application/json').send(json);
    });
  }

  return router;
}
