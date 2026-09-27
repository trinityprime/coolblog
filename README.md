## Usage

```bash
npm install
npm run dev
npm run build
```

## Shared Blog (Cloudflare D1)

The blog uses a D1 database named `kouvera-blog`. Posts are public to read; publishing and deleting require the `BLOG_ADMIN_TOKEN` secret.

This app now requires a Cloudflare Worker runtime for the blog API. Configure the Cloudflare build command as `npm run build`; do not deploy the output of `npm run generate`, which is static and does not include the server API routes.

### Cloudflare setup

1. In Cloudflare, create a D1 database named `kouvera-blog`.
2. Apply the SQL in `migrations/0001_create_blog_posts.sql` and `migrations/0002_create_blog_status.sql` to the database, or run the Wrangler D1 migration command against the remote database.
3. In your Worker's **Settings > Bindings**, add a D1 database binding named `BLOG_DB` and select `kouvera-blog`.
4. In **Settings > Variables and Secrets**, add `BLOG_ADMIN_TOKEN` as a secret. Use a long random value; do not add it as a plain variable or commit it.
5. Redeploy the Worker so the D1 binding and secret are available to the API routes.

The Worker build uses the `cloudflare_module` Nitro preset and `nodejs_compat` flag from `nuxt.config.ts` and `wrangler.jsonc`.

The Worker reads posts and the public status message from D1. Sign in with the owner key on the blog page to create a signed, HttpOnly session cookie that lasts 24 hours. The key is not stored in browser storage; sign in again after the cookie expires or on another device. While signed in, use the status strip's Edit control to update the message.

### Local development

Create a `.dev.vars` file from `.dev.vars.example` and replace the example value with a local random key. Apply the schema to the local D1 database, then start Nuxt:

```bash
npm run db:migrate:local
npm run dev
```

Local D1 data is separate from production data. Posts previously saved in browser `localStorage` are not moved to D1 automatically.
