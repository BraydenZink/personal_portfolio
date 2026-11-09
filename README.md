# Brayden Zink: Personal Portfolio

A dynamic portfolio site for a Purdue University graduate student preparing for a career in construction project management. It's a React app with an Express API, deployed to Google Cloud Run.

**Live site:** TODO(BRAYDEN): add the Cloud Run URL after deploying

## Features

- **Home:** introduction, value proposition and an animated blueprint-style hero
- **Projects:** three projects or awards with images, tools, links and category filtering
- **Skills:** proficiency bars with descriptive levels, plus what's being learned now
- **Contact:** a form that sends email through Resend, plus a LinkedIn link
- **Dynamic content:** pages load their content from a JSON API
- **Responsive:** tested at 375, 768 and 1440 pixels wide ([screenshots](docs/screenshots/))

## Tech stack

React, Vite, React Router, Tailwind CSS, Node.js, Express, Resend, Docker, Google Cloud Run, Vitest and Playwright.

## Run it locally

```bash
npm install
cp .env.example .env
npm run dev
```

Then open http://localhost:5173. The contact form needs the Resend values in `.env`; everything else works without them.

## Project documents

| Document | Purpose |
|---|---|
| [CLAUDE.md](CLAUDE.md) | Rules file for Claude Code |
| [PLAN.md](PLAN.md) | The original plan from Claude Code's plan mode |
| [PROMPT_LOG.md](PROMPT_LOG.md) | Log of the prompts used to build this project |
| [case-studies/](case-studies/) | Write-ups of the three featured projects |
| [docs/YOUR_INPUT_NEEDED.md](docs/YOUR_INPUT_NEEDED.md) | Content the site owner must supply |
| [docs/SETUP_AND_DEPLOY.md](docs/SETUP_AND_DEPLOY.md) | Install, GitHub and Cloud Run steps |

## Project structure

```
server/          Express app, API routes and content files (server/data)
src/             React pages, components and hooks
public/images/   Headshot and project images
tests/           API tests (Vitest) and browser tests (Playwright)
docs/            Guides and responsive test screenshots
```
