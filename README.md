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
2. Run the SQL in `migrations/0001_create_blog_posts.sql` in the database's SQL console.
3. In your Worker's **Settings > Bindings**, add a D1 database binding named `BLOG_DB` and select `kouvera-blog`.
4. In **Settings > Variables and Secrets**, add `BLOG_ADMIN_TOKEN` as a secret. Use a long random value; do not add it as a plain variable or commit it.
5. Redeploy the Worker so the D1 binding and secret are available to the API routes.

The Worker build uses the `cloudflare_module` Nitro preset and `nodejs_compat` flag from `nuxt.config.ts` and `wrangler.jsonc`.

The Worker reads posts from D1 through `/api/blog`. The owner key is entered on the blog page and is kept in session storage for that browser tab. Enter it again on other devices.

### Local development

Create a `.dev.vars` file from `.dev.vars.example` and replace the example value with a local random key. Apply the schema to the local D1 database, then start Nuxt:

```bash
npm run db:migrate:local
npm run dev
```

Local D1 data is separate from production data. Posts previously saved in browser `localStorage` are not moved to D1 automatically.
