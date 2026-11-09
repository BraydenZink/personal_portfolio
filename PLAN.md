# Personal Portfolio: Implementation Plan

## Context

Brayden needs a professional, dynamic portfolio built in React, pushed to GitHub and deployed to Google Cloud Run. Brayden is a graduate student at Purdue University studying Business and Technology and is targeting construction project management roles.

The repo must include `CLAUDE.md`, this plan and a prompt log. The site must have a landing page, a showcase of 3 projects or awards, a skills section with proficiency indicators, contact info with a working form, responsive design tested at 3+ viewports, and professional polish.

**Current state:** the repo is empty, with no commits or remote. `git`, `gh` and `gcloud` are installed. Node and npm are not. Docker is not installed, and isn't needed locally because Cloud Build builds the image.

**Decisions made:**
- Contact form sends email through Resend.
- Visual style is dark tech.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + Vite (JavaScript), React Router | The required framework. Plain JS is easier for Brayden to maintain than TypeScript. |
| Styling | Tailwind CSS | Meets the responsive framework requirement. Colors and fonts are defined once as theme tokens. |
| Backend | Node + Express | Makes the app dynamic and serves the built React app from one Cloud Run service. |
| Email | Resend SDK | The chosen contact form delivery. |
| Tests | Vitest + Supertest (API), Playwright (viewports, links, images) | Covers the responsive and "no broken links or images" requirements. |
| Hosting | Cloud Run, built from a `Dockerfile` by `gcloud run deploy --source .` | No local Docker needed. |

## What makes it dynamic

- Pages fetch their content from the API, with loading and error states:
  - `GET /api/profile`
  - `GET /api/projects`
  - `GET /api/skills`
- `POST /api/contact` validates the input on the server, applies a rate limit and a spam honeypot, then sends the email.
- The Projects page has client-side filtering by category.
- If the Resend key is missing or sending fails, the form shows a clear error and offers the email address instead.

## Pages

1. **Home (`/`):** name, professional introduction, value proposition, headshot, calls to action and links to the other pages. The hero is an animated gradient over a blueprint-style grid in CSS/SVG, which ties dark tech to construction.
2. **Projects (`/projects`):** a responsive card grid. Each of the 3 cards has an image, title, description, tools and a link.
3. **Skills (`/skills`):** grouped skills with progress bars and a descriptive level (for example, "Proficient"), plus a separate "Currently learning" group.
4. **Contact (`/contact`):** form (name, email, message), email address and LinkedIn link.
5. **Shared:** sticky navigation with a mobile menu, footer, 404 page, page titles and meta descriptions, and a resume link if one is supplied.

**Design system:** deep navy background, teal accent, one font pairing, a consistent spacing scale, and WCAG AA contrast, visible focus states and reduced-motion support.

## Project structure

```
CLAUDE.md, PLAN.md, PROMPT_LOG.md, README.md
Dockerfile, .dockerignore, .gitignore, .env.example
package.json, vite.config.js
docs/YOUR_INPUT_NEEDED.md      checklist of everything Brayden must supply
docs/SETUP_AND_DEPLOY.md       install, terminal, GitHub and Cloud Run steps
server/index.js                Express app, static hosting, SPA fallback
server/routes/                 content and contact routes
server/data/                   profile.json, projects.json, skills.json (edit content here)
src/pages/, src/components/, src/hooks/, src/lib/
public/images/                 headshot and project images
tests/api/, tests/e2e/
```

## Required repo documents

- **`CLAUDE.md`:** rules for stack, structure, content location, the secrets policy, test commands and keeping the prompt log current.
- **`PLAN.md`:** an unedited copy of this approved plan.
- **`PROMPT_LOG.md`:** Brayden's prompts verbatim and dated, including the answers to planning questions, starting with the original request. `CLAUDE.md` requires each new prompt to be added.

## Areas that need Brayden's input

All content lives in `server/data/` and `public/images/`, so no component code needs editing. Unfilled items are marked `TODO(BRAYDEN)` and can be found with a search. **No experience, skills or achievements will be invented.** Anything not supplied stays a visible placeholder and must be replaced before the site is shared.

| # | Needed | Notes |
|---|---|---|
| 1 | Name as displayed, and exact degree title and graduation date | "Brayden Zink" is taken from the git config, so please confirm it. |
| 2 | Introduction and value proposition | I'll draft these for you to correct. A few facts about your background and goals will make them stronger. |
| 3 | Headshot | JPG or PNG, square, at least 800×800. |
| 4 | Two more projects or awards, plus details | Title, description, tools used, link and image for each. The third is this portfolio, which is real and has both a repo and a live demo. |
| 5 | Project links | **Each needs a GitHub repo or live demo.** For non-code work such as a schedule or estimate, a small public GitHub repo holding the deliverables and a README would satisfy this. Remove any confidential client data first. |
| 6 | Skills and honest proficiency levels | Starter list to confirm or edit: CPM scheduling, cost estimating, RFIs and submittals, safety, Procore, Primavera P6, MS Project, Bluebeam, Excel, Power BI, Revit or Navisworks. |
| 7 | Public email and LinkedIn URL | Please confirm which email to publish on the site. |
| 8 | Accounts | GitHub, Google Cloud with billing enabled, and Resend. Cloud Run needs billing on, though a low-traffic site usually stays within the free tier. |
| 9 | Resume PDF (optional) | Adds a download link. |

## Implementation steps

1. **Install Node LTS** through `nvm` in Brayden's home folder. This is needed to build and test. I'll run it unless Brayden prefers to do it, and the same commands go in the guide.
2. **Scaffold** the project, Tailwind, Express, linting, and the three required documents.
3. **Build the API and content files**, with placeholders where input is pending.
4. **Build the design system, layout and four pages.**
5. **Build the contact flow** with validation, rate limit (`trust proxy` set for Cloud Run), honeypot and Resend.
6. **Add production pieces:** multi-stage `Dockerfile` that listens on `$PORT`, and security headers through `helmet`.
7. **Write and run tests**, and fix what they find.
8. **Write `docs/SETUP_AND_DEPLOY.md` and `docs/YOUR_INPUT_NEEDED.md`.**
9. **Hand over for deployment.** Pushing to GitHub and deploying are left for Brayden to run from the guide, or I'll do them on request.

## What the deployment guide will cover

**Local install and run (WSL):** `nvm`, Node LTS, `npm install`, copy `.env.example` to `.env`, `npm run dev`, and opening `http://localhost:5173`.

**GitHub:**
- `gh auth login`
- `gh repo create` (public, so reviewers can see it)
- Commit and push
- Confirm `.env` isn't in the repo

**Resend:** create an account and API key. Without a verified domain, Resend only sends from `onboarding@resend.dev` to the account's own email address, so the Resend account must use the address that should receive messages.

**Google Cloud Run:**
1. `gcloud auth login`, then create or select a project and link billing.
2. Enable the Run, Cloud Build, Artifact Registry and Secret Manager APIs.
3. Store the Resend key in Secret Manager and grant the Cloud Run service account access to it.
4. Deploy with `gcloud run deploy portfolio --source . --region us-central1 --allow-unauthenticated --set-secrets RESEND_API_KEY=...:latest --max-instances 2`.
5. Open the service URL, send a test message, and put the live URL into the portfolio project entry.
6. Redeploy with the same command after any change.
7. Optional: use the Cloud Run console to connect the GitHub repo for automatic deploys.

## Verification

- **API tests:** content endpoints return valid data. The contact route accepts valid input and rejects invalid input, honeypot hits and excess requests. Resend is mocked.
- **Responsive tests in Playwright at 375×812, 768×1024 and 1440×900:** every page renders with no horizontal overflow and the navigation works. Screenshots are saved so the results can be reviewed.
- **Links and images:** a Playwright crawl checks internal links and that images load. External links are checked once real URLs are filled in.
- **Polish:** production build, ESLint and a `cspell` spell check all pass, with a review of the screenshots.
- **Production parity:** run the built app through Express locally to confirm the API and page refreshes on routes like `/projects`.
- **After deployment:** Brayden sends a real message from the live site and confirms the email arrives. A real email can't be tested until the Resend key exists.

Since Docker isn't installed locally, the `Dockerfile` is first exercised by Cloud Build during the first deploy.
