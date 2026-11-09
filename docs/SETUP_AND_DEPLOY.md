# Setup and deployment guide

Run all commands in your WSL (Ubuntu) terminal, from the project folder, unless a step says otherwise:

```bash
cd ~/projects/personal_portfolio
```

## 1. Software

| Software | Status on your machine | Needed for |
|---|---|---|
| WSL with Ubuntu | Installed | The terminal environment |
| Git | Installed | Version control |
| GitHub CLI (`gh`) | Installed | Creating the GitHub repo |
| Google Cloud CLI (`gcloud`) | Installed | Deploying |
| Node.js and npm, through nvm | Installed during this project | Running the site |
| Browser libraries | **You need to install these** | Running the browser tests only |
| Docker | Not needed | Google builds the container for you |

Open a **new terminal** so it picks up Node, then check that it works:

```bash
node --version
```

Install the browser libraries (this asks for your password):

```bash
sudo apt-get install -y libnspr4 libnss3 libasound2t64
npx playwright install chromium
```

If you ever set this up on another Ubuntu machine, install Node first:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.41.0/install.sh | bash
source ~/.bashrc
nvm install --lts
```

## 2. Run the site locally

```bash
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173 in your browser. Press `Ctrl+C` in the terminal to stop.

To edit content, follow [YOUR_INPUT_NEEDED.md](YOUR_INPUT_NEEDED.md). Save a file and refresh the page to see the change.

## 3. Set up contact form email (Resend)

1. Create a [Resend](https://resend.com/signup) account using the address where you want to receive messages. Without a verified domain, Resend only delivers to your account's own address.
2. Go to **API Keys** in Resend, create a key and copy it. Resend only shows it once.
3. Open `.env` and fill in these two lines. `.env` stays on your computer and is never committed.

   ```
   RESEND_API_KEY=your_key
   CONTACT_TO_EMAIL=the_address_on_your_resend_account
   ```

4. Restart `npm run dev`, send yourself a test message from the Contact page, and check that it arrives.

## 4. Push to GitHub

1. Sign in, choosing **GitHub.com**, **HTTPS** and **Login with a web browser**:

   ```bash
   gh auth login
   ```

2. Stage everything and check the list. **`.env` must not appear in it.**

   ```bash
   git add .
   git status
   ```

3. Commit, then create the public repo and push. **Keep the name `personal_portfolio`**, because the project links on the site point to it.

   ```bash
   git commit -m "Build personal portfolio site"
   gh repo create personal_portfolio --public --source=. --remote=origin --push
   ```

4. Open the repo and confirm that `CLAUDE.md`, `PLAN.md` and `PROMPT_LOG.md` are there:

   ```bash
   gh repo view --web
   ```

## 5. Deploy to Google Cloud Run

### One-time setup

1. Sign in:

   ```bash
   gcloud auth login
   ```

2. Create a project. The ID must be unique across Google Cloud, so add something of your own, such as your initials and a number:

   ```bash
   gcloud projects create YOUR_PROJECT_ID --name="Portfolio"
   gcloud config set project YOUR_PROJECT_ID
   ```

3. **In your browser:** open the [billing page](https://console.cloud.google.com/billing/linkedaccount), select your project and link a billing account. Create one if asked.

4. Turn on the services the site needs:

   ```bash
   gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com
   ```

5. Store your Resend key in Secret Manager. Paste the key at the prompt and press Enter. It won't be shown on screen or saved in your shell history.

   ```bash
   read -rs RESEND_KEY
   printf '%s' "$RESEND_KEY" | gcloud secrets create resend-api-key --data-file=-
   unset RESEND_KEY
   ```

6. Give Cloud Run access to the secret, and give the build the permissions it needs:

   ```bash
   PROJECT_NUMBER=$(gcloud projects describe "$(gcloud config get-value project)" --format='value(projectNumber)')
   SERVICE_ACCOUNT="$PROJECT_NUMBER-compute@developer.gserviceaccount.com"

   gcloud secrets add-iam-policy-binding resend-api-key \
     --member="serviceAccount:$SERVICE_ACCOUNT" \
     --role="roles/secretmanager.secretAccessor"

   gcloud projects add-iam-policy-binding "$(gcloud config get-value project)" \
     --member="serviceAccount:$SERVICE_ACCOUNT" \
     --role="roles/run.builder"
   ```

### Deploy

Replace `YOUR_RESEND_EMAIL` with the address on your Resend account:

```bash
gcloud run deploy portfolio \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --max-instances 2 \
  --set-env-vars CONTACT_TO_EMAIL=YOUR_RESEND_EMAIL \
  --set-secrets RESEND_API_KEY=resend-api-key:latest
```

Answer `Y` if it asks to create an Artifact Registry repository. The first deploy takes a few minutes and ends by printing a **Service URL**.

### Check the live site

1. Open the Service URL and visit every page at desktop and phone widths.
2. Send a message through the Contact page and confirm the email arrives.
3. You can see the service and its logs in the [Cloud Run console](https://console.cloud.google.com/run).

### Finish up

1. Put the Service URL into `README.md`.
2. Run `npm run todo` to confirm nothing is left to fill in.
3. Publish the update by running the same `gcloud run deploy` command again, then push to GitHub:

   ```bash
   git add .
   git commit -m "Add live site link"
   git push
   ```

## 6. Making changes later

Each time you update the site:

```bash
npm run check
git add .
git commit -m "Describe your change"
git push
```

Then run the `gcloud run deploy` command again. **Pushing to GitHub doesn't update the live site by itself.** If you'd like it to, open your service in the Cloud Run console and use its option for connecting a repository to set up continuous deployment.

## Troubleshooting

| Problem | What to try |
|---|---|
| `node: command not found` | Open a new terminal, or run `source ~/.bashrc` |
| Contact form says the message couldn't be sent | Check `RESEND_API_KEY` and `CONTACT_TO_EMAIL`. Resend's dashboard shows rejected messages. The address must match your Resend account |
| Browser tests fail to start with a missing library error | Run the `sudo apt-get` command from section 1 |
| Deploy fails with a permission or build error | Confirm billing is linked and step 6 of the setup ran. The deploy output includes a link to the build logs |
| Deploy says the secret can't be accessed | Re-run the first command in step 6 of the setup |
