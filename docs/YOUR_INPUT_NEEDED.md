# What I still need from you

All site content is filled in. Only these remain:

| Item | Where | Notes |
|---|---|---|
| Live site URL | `README.md` | Add it after deploying |
| Resume (optional) | `public/resume.pdf`, then set `resume` in `server/data/profile.json` to `"/resume.pdf"` | Adds a download link. Remove your phone number and home address first, because it will be public |

To check for leftover placeholders in the content files, run:

```bash
npm run todo
```

## Project links

Each project links to its case study in `case-studies/`, at `https://github.com/BraydenZink/personal_portfolio/...`. These links only work after the code is pushed to a GitHub repo named exactly `personal_portfolio` on the `BraydenZink` account.

**Keep confidential information out of the case studies.** For the US 31 job, that means no E&B Paving cost data, bid numbers or internal documents unless the company has approved them.

## After updating content

Run the checks, which also refresh the screenshots in `docs/screenshots/`:

```bash
npm run check
```

If the spell check flags a correct word, such as a company name, add it to `cspell.json`.

## Accounts you need

| Account | Used for | Cost |
|---|---|---|
| [GitHub](https://github.com/signup) | Hosting the code | Free |
| [Google Cloud](https://console.cloud.google.com/) | Running the site | Billing must be on. A low-traffic site usually stays within the free tier, but check [current pricing](https://cloud.google.com/run/pricing) |
| [Resend](https://resend.com/signup) | Sending contact form email | Has a free plan. **Sign up with the email address where you want to receive messages** |
