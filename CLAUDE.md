# Project rules

Personal portfolio for Brayden Zink, a Purdue University graduate student in Business and Technology targeting construction project management roles. It's a React app served by an Express API and deployed to Google Cloud Run.

## Stack

- **Frontend:** React, Vite, React Router and Tailwind CSS, in plain JavaScript (no TypeScript).
- **Backend:** Node and Express. One service serves both the API and the built React app.
- **Email:** Resend, used only in `server/lib/email.js`.
- **Tests:** Vitest and Supertest for the API, Playwright for the browser.

## Where things live

- `server/data/*.json`: all site content. Change content here, not in components.
- `public/images/`: headshot and project images.
- `server/app.js`: Express setup. `server/routes/`: API routes.
- `src/pages/`: one file per page. `src/components/`: shared UI.
- `src/index.css`: design tokens (colors and fonts). Use these tokens instead of hard-coded colors.

## Rules

1. **Never invent facts about Brayden.** Experience, skills, proficiency levels, awards and links must come from Brayden. Mark anything unknown as `TODO(BRAYDEN): what is needed`, which the site shows as a visible prompt. List what remains with `npm run todo`.
2. **Never commit secrets.** API keys go in `.env` locally and in Secret Manager on Cloud Run. Only `.env.example`, with blank values, is committed.
3. **Keep the prompt log current.** Add each of Brayden's prompts to `PROMPT_LOG.md` verbatim, with its date, in the order received.
4. **Don't edit `PLAN.md`.** It's the original approved plan and is kept as a record.
5. **Keep it responsive.** Every page must work at 375, 768 and 1440 pixels wide with no horizontal scrolling.
6. **Keep the design consistent and accessible.** Maintain WCAG AA contrast, visible focus states, labeled form fields and reduced-motion support.
7. **Don't push or deploy without being asked.**

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Run the site locally at http://localhost:5173 with live reload |
| `npm run build && npm start` | Run the production build at http://localhost:8080 |
| `npm run check` | Run lint, spell check, API tests and browser tests. Must pass before pushing |
| `npm run todo` | List content placeholders that still need filling in |

Browser tests also rewrite the screenshots in `docs/screenshots/`.
