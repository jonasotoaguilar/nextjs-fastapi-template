### General Description

Deployment on **Vercel** is supported, with dedicated buttons for the **Frontend** and **Backend** applications. Both require specific configurations during and after deployment to ensure correct operation.

---

### Frontend Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjonasotoaguilar%2Fnextjs-fastapi-template%2Ftree%2Fmain%2Fui&env=API_BASE_URL&envDescription=The%20API_BASE_URL%20is%20the%20backend%20URL%20where%20the%20frontend%20sends%20requests.)

- Click the **Frontend** button above to start the deployment process.
- During deployment, you will be asked to configure `API_BASE_URL`. Use a provisional value (e.g., `https://`) for now, as it will be updated with the backend URL later.
- Complete the deployment process [here](#post-deployment-configuration).

### Backend Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjonasotoaguilar%2Fnextjs-fastapi-template%2Ftree%2Fmain%2Fapi&env=CORS_ORIGINS,ACCESS_SECRET_KEY,RESET_PASSWORD_SECRET_KEY,VERIFICATION_SECRET_KEY&stores=%5B%7B%22type%22%3A%22postgres%22%7D%5D)

- Click the **Backend** button above to start deployment.
- First, configure the database. The connection is automatically configured, so follow the steps and it should work by default.
- During the deployment process, you will be asked to configure the following environment variables:
  - **CORS_ORIGINS**
    - Set this to `["*"]` initially to allow all origins. Later, you can update this with the frontend URL.

  - **ACCESS_SECRET_KEY**, **RESET_PASSWORD_SECRET_KEY**, **VERIFICATION_SECRET_KEY**
    - During deployment, you can temporarily set these secret keys to simple text strings (e.g., `examplesecret`). However, you must generate secure keys and update them after deployment in the **Post-Deployment Configuration** section.

- Complete the deployment process [here](#post-deployment-configuration).

## CI Configuration (GitHub Actions) for Production Deployment

We provide the **prod-api-deploy.yml** and **prod-ui-deploy.yml** files to enable continuous integration through GitHub Actions. To connect them to GitHub, simply move them to the `.github/workflows/` directory.

You can do this with the following commands:

```bash
 mv prod-api-deploy.yml .github/workflows/prod-api-deploy.yml
 mv prod-ui-deploy.yml .github/workflows/prod-ui-deploy.yml
```

### Prerequisites

1. **Create a Vercel Token**:
   - Generate your [Vercel Access Token](https://vercel.com/account/tokens).
   - Save the token as `VERCEL_TOKEN` in your GitHub secrets.

2. **Install Vercel CLI**:
   ```bash
   pnpm i -g vercel@latest
   ```
3. Authenticate your account:
   ```bash
   vercel login
   ```

### Database Creation (Required)

1. **Choose a Database**
   - You can use your hosted database on a different service or opt for the [Neon](https://neon.tech/docs/introduction) database, which integrates perfectly with Vercel.

2. **Configure a Neon Database through Vercel**
   - On your **Project Dashboard** page in Vercel, navigate to the **Storage** section.
   - Select the **Create a Database** option to provision a Neon database.

3. **Configure Database URL**
   - After creating the database, get the **Database URL** provided by Neon.
   - Include this URL in your **Environment Variables** under `DATABASE_URL`.

4. **Migrate the Database**
   - Database migration will occur automatically during the GitHub Action deployment, setting up the necessary tables and schema.

### Frontend Configuration

1. Link the `ui` project.

2. Navigate to the `ui` directory and run:
   ```bash
   cd ui
   vercel link
   ```
3. Follow the instructions:
   - Link to an existing project? No
   - Modify settings? No

4. Save Project IDs and add GitHub Secrets:

- Open `ui/.vercel/project.json` and add the following to your GitHub repository secrets:
  - `projectId` → `VERCEL_PROJECT_ID_FRONTEND`
  - `orgId` → `VERCEL_ORG_ID`

### Backend Configuration

1. Link the `api` project.

2. Navigate to the `api` directory and run:

   ```bash
   cd api
   vercel link --local-config=vercel.prod.json
   ```

   - We use a specific configuration file to set the `--local-config` value.

3. Follow the instructions:
   - Link to an existing project? No
   - Modify settings? No

4. Save Project IDs and add GitHub Secrets:

- Open `api/.vercel/project.json` and add the following to your GitHub repository secrets:
  - `projectId` → `VERCEL_PROJECT_ID_BACKEND`
  - `orgId` → `VERCEL_ORG_ID` (Only in case you haven't added it before)

5. Update requirements.txt:

   ```bash
   cd api
   uv export > requirements.txt
   ```

   - It is necessary to export a new `requirements.txt` file for Vercel deployment when `uv.lock` is modified.

### Notes

- Once everything is configured, run `git push` and deployment will happen automatically.
- Please ensure you complete the setup for both frontend and backend separately.
- See the [Vercel CLI Documentation](https://vercel.com/docs/cli) for more details.
- You can find the `project_id` in the project settings on the Vercel web portal.
- You can find the `organization_id` in the organization settings on the Vercel web portal.

## Post-Deployment Configuration

### Frontend

- Navigate to the **Settings** page of the deployed frontend project.
- Go to the **Environment Variables** section.
- Update the `API_BASE_URL` variable with the backend URL once the backend deployment is complete.

### Backend

- Access the **Settings** page of the deployed backend project.
- Navigate to the **Environment Variables** section and update the following variables with secure values:
  - **CORS_ORIGINS**
    - Once the frontend is deployed, replace `["*"]` with the actual frontend URL.

  - **ACCESS_SECRET_KEY**
    - Generate a secure key for API access and configure it here.

  - **RESET_PASSWORD_SECRET_KEY**
    - Generate a secure key for password reset functionality and configure it.

  - **VERIFICATION_SECRET_KEY**
    - Generate a secure key for user verification and configure it.

- For detailed instructions on how to configure these secret keys, see the [Environment Variable Configuration](get-started.md#environment-variable-configuration) section.

### Enabling Fluid Serverless

[Fluid](https://vercel.com/docs/functions/fluid-compute) is Vercel's new concurrency model for serverless functions, allowing them to handle multiple requests per execution instead of starting a new instance for each request. This improves performance, reduces cold starts, and optimizes resource usage, making serverless workloads more efficient.

Follow this [guide](https://vercel.com/docs/functions/fluid-compute#how-to-enable-fluid-compute) to activate Fluid.
