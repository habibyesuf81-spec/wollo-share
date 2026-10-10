# Evangadi Resources

A React resource library with a local-first database. Learners can save completed videos, and local admins can review activity and grant access to other local accounts. Supabase is available as an optional cloud backend.

## Requirements

- Node.js 20.6 or later and npm to run or rebuild the app from source

## Run locally

```powershell
npm install
npm run dev
```

Vite prints the local URL, usually <http://localhost:5173>.

Local mode is the default and does not require a `.env.local` file, Supabase project, or API server. Accounts, hashed passwords, progress, and activity are stored in this browser's local storage; uploaded files are stored in this browser's IndexedDB. Nothing syncs to other browsers or devices. Only `habibyesuf81@gmail.com` is the local admin; every other account is a learner. This is intended for local development, not production authentication or shared hosting.

The admin can open **Admin panel → Materials** to create as many categories and subcategories as browser storage permits, then add links or upload files from this computer to them. Choose **Code project** to add a repository link or uploaded source file to the library's **Code** filter. Categories can contain any number of subcategories. Learners can filter the library by category and subcategory. Uploaded files remain on this browser and are not sent to a server or synced to other browsers.

If Node.js is unavailable but this workspace already has a `dist` build and Java 18 or later, run the VS Code task **Preview Evangadi locally**. It serves that existing build at <http://127.0.0.1:5173>; source changes still require Node.js to rebuild.

Start the API in a second terminal:

```powershell
npm run api
```

The Vite dev server proxies `/api` requests to the API on port 3001. `GET /api/health` is public; `GET /api/me` requires a valid Supabase bearer token.

## Delete all accounts

To permanently delete every Supabase auth account, set the full `SUPABASE_SECRET_KEY` in the ignored `.env.local` file, then run:

```powershell
npm run delete:users
```

The script displays the number of accounts and requires typing `DELETE ALL <project-ref>` before deleting anything. It does not display email addresses or the secret key. Profiles and progress are removed only where the database foreign keys are configured to cascade. This action cannot be undone.

## Optional: connect Supabase

1. Create a Supabase project.
2. In the Supabase SQL Editor, run the contents of `supabase.sql`.
3. Add the local Vite URL shown in the previous section and the production app URL (including `/wolloshare/` for GitHub Pages) to Authentication URL settings as allowed redirect URLs.
4. Copy `.env.example` to `.env.local`, set `VITE_DATA_MODE=supabase`, and set the Vite and server URL/publishable-key variables to your project URL and publishable key. Add `SUPABASE_SECRET_KEY` only to the ignored local env file if a trusted server route needs admin access; never prefix it with `VITE_` or put it in client code.
5. Set the shared invite code privately in the Supabase SQL Editor, replacing the placeholder with the code you want. Do not add the real code to a checked-in file:

   ```sql
   insert into private.app_invite_config (singleton, invite_code)
   values (true, '<your shared invite code>')
   on conflict (singleton) do update set invite_code = excluded.invite_code;
   ```

6. Configure a custom SMTP provider under **Authentication → SMTP Settings**. Supabase's built-in mailer is rate-limited and is not intended for unrestricted delivery. Then, under **Authentication → Email Templates → Confirm signup**, use a template that includes the OTP and links back to the app's verification page. For example:

   ```html
   <h2>Confirm your email</h2>
   <p>Your one-time code is: <strong>{{ .Token }}</strong></p>
   <p><a href="{{ .RedirectTo }}">Open the email verification page</a></p>
   ```

   Set the subject to something like **Your Evangadi verification code**. The app supplies a redirect URL ending in `?verify=1&email=...`; `{{ .RedirectTo }}` uses that URL, while `{{ .Token }}` supplies the code. The dashboard may require SMTP before enabling template edits.
7. Restart the Vite server and create an account with any valid email. Enter the unique code from the confirmation email, then enter the shared invite code to finish registration. Supabase/provider-level email sending quotas may still apply.
8. The final statements in `supabase.sql` backfill profiles for existing auth users and promote `habibyesuf81@gmail.com` to admin. If that is not the account you want as admin, change the email in those statements before running the SQL. The admin must also complete email and invite verification before the admin panel is available.

New accounts can use any valid email and must complete both verification steps. Other users can browse the public course catalog after verification; progress tracking remains locked until the admin grants access. Admins can grant or revoke access from the admin user table and always retain access. The database enforces these checks with row-level security, and only verified admins can change a learner's access flag. Invite attempts are limited to five per account per 15 minutes.

The admin dashboard also lists completed-video counts, last-active timestamps, and the latest 50 sign-in, resource-open, and completion events. Learners can only read and change their own progress and insert activity for themselves; only admins can read everyone’s activity. Re-run the latest `supabase.sql` whenever its schema changes so the approval column, activity table, and row-level security policies exist.

## Deploy to GitHub Pages

The repository includes a GitHub Actions workflow that builds and publishes the site to GitHub Pages when changes are pushed to `main`.

1. Create a Supabase project and run the current `supabase.sql` in its SQL Editor, then complete the invite-code and email-template setup in the Supabase section above.
2. In the GitHub repository, add the Actions secrets `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from the Supabase project. These are public browser configuration values; never add the Supabase secret key to GitHub Actions or client-side variables.
3. In **Settings → Pages**, select **GitHub Actions** as the build and deployment source.
4. In Supabase Authentication URL settings, set the production Site URL and add `https://habibyesuf81-spec.github.io/wolloshare/` as an allowed redirect URL. Also allow your local development URL if needed.
5. Push to `main` and check the **Actions** tab for the deployment result. The deployed site will be at <https://habibyesuf81-spec.github.io/wolloshare/>.

The deployment deliberately uses Supabase mode; the local browser database is not suitable for a public site or secure admin access. Supabase currently stores authentication, learner access, progress, and activity. Custom categories, materials, code projects, and uploaded files are still local-browser data and do not sync to the deployed site or other users. Shared admin-managed materials and cloud file uploads require a shared database/storage implementation before those features can be used as a production library.

## Resources

Courses use the supplied links in reverse order: the last link is Course 01, followed by Course 02 through Course 48. Search and filters work in the library, and each video can be marked complete. Thumbnails and Supabase sign-in require an internet connection.
