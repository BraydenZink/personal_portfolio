import { existsSync } from 'node:fs';
import path from 'node:path';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../../server/app.js';
import { EmailNotConfiguredError } from '../../server/lib/email.js';

const VALID_MESSAGE = { name: 'Alex Rivera', email: 'alex@example.com', message: 'Hello, I would like to talk.' };

const appWith = (sendEmail = vi.fn().mockResolvedValue(), contactRateLimit = 100) => ({
  sendEmail,
  app: createApp({ sendEmail, contactRateLimit }),
});

describe('content endpoints', () => {
  it('returns the profile', async () => {
    const res = await request(appWith().app).get('/api/profile').expect(200);
    expect(res.body).toMatchObject({ name: expect.any(String), valueProposition: expect.any(String) });
  });

  it('returns exactly three projects, each with every required field', async () => {
    const res = await request(appWith().app).get('/api/projects').expect(200);
    expect(res.body).toHaveLength(3);
    for (const project of res.body) {
      expect(project).toMatchObject({
        title: expect.any(String),
        description: expect.any(String),
        tools: expect.any(Array),
        image: expect.any(String),
        links: expect.any(Array),
      });
      expect(project.links.length).toBeGreaterThan(0);
    }
  });

  it('links each project only to case studies that exist in this repo', async () => {
    const REPO_FILE = 'https://github.com/BraydenZink/personal_portfolio/blob/main/';
    const res = await request(appWith().app).get('/api/projects').expect(200);
    for (const { url } of res.body.flatMap((project) => project.links)) {
      if (!url.startsWith(REPO_FILE)) continue;
      expect(existsSync(path.resolve(import.meta.dirname, '../..', url.slice(REPO_FILE.length))), url).toBe(true);
    }
  });

  it('returns skills with a level name for every rated skill', async () => {
    const res = await request(appWith().app).get('/api/skills').expect(200);
    expect(res.body.groups.length).toBeGreaterThan(0);
    for (const skill of res.body.groups.flatMap((group) => group.skills)) {
      if (typeof skill.level === 'number') expect(res.body.levels[skill.level]).toBeDefined();
    }
  });

  it('returns JSON 404 for an unknown API path', async () => {
    const res = await request(appWith().app).get('/api/nope').expect(404);
    expect(res.body.error).toBeDefined();
  });
});

describe('POST /api/contact', () => {
  it('sends a valid message with cleaned values', async () => {
    const { app, sendEmail } = appWith();
    await request(app)
      .post('/api/contact')
      .send({ ...VALID_MESSAGE, name: '  Alex\r\nBcc: x@example.com ' })
      .expect(200);
    expect(sendEmail).toHaveBeenCalledWith({
      name: 'Alex Bcc: x@example.com',
      email: VALID_MESSAGE.email,
      message: VALID_MESSAGE.message,
    });
  });

  it.each([
    ['name', { name: '   ' }],
    ['name', { name: 'x'.repeat(101) }],
    ['email', { email: 'not-an-email' }],
    ['email', { email: 42 }],
    ['message', { message: 'short' }],
    ['message', { message: 'x'.repeat(5001) }],
  ])('rejects an invalid %s', async (field, override) => {
    const { app, sendEmail } = appWith();
    const res = await request(app).post('/api/contact').send({ ...VALID_MESSAGE, ...override }).expect(400);
    expect(res.body.errors[field]).toBeDefined();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('reports success for honeypot hits without sending anything', async () => {
    const { app, sendEmail } = appWith();
    await request(app).post('/api/contact').send({ ...VALID_MESSAGE, website: 'spam.example' }).expect(200);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('rejects malformed JSON with a 400', async () => {
    await request(appWith().app)
      .post('/api/contact')
      .set('Content-Type', 'application/json')
      .send('{"name":')
      .expect(400);
  });

  it('rejects an oversized body with a 413', async () => {
    await request(appWith().app)
      .post('/api/contact')
      .send({ ...VALID_MESSAGE, message: 'x'.repeat(30_000) })
      .expect(413);
  });

  it('blocks requests over the rate limit', async () => {
    const { app, sendEmail } = appWith(undefined, 2);
    await request(app).post('/api/contact').send(VALID_MESSAGE).expect(200);
    await request(app).post('/api/contact').send(VALID_MESSAGE).expect(200);
    await request(app).post('/api/contact').send(VALID_MESSAGE).expect(429);
    expect(sendEmail).toHaveBeenCalledTimes(2);
  });

  it('returns 503 when email is not configured', async () => {
    const { app } = appWith(vi.fn().mockRejectedValue(new EmailNotConfiguredError('missing')));
    await request(app).post('/api/contact').send(VALID_MESSAGE).expect(503);
  });

  it('returns 502 without leaking details when the provider fails', async () => {
    const { app } = appWith(vi.fn().mockRejectedValue(new Error('secret provider detail')));
    const res = await request(app).post('/api/contact').send(VALID_MESSAGE).expect(502);
    expect(JSON.stringify(res.body)).not.toContain('secret');
  });
});
