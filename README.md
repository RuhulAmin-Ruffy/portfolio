# Portfolio

A Next.js portfolio with a built-in admin panel. All text, projects, illustrations and images are stored in Neon Postgres and editable at `/admin`.

## Run locally

```bash
npm install
npm run db:setup   # creates tables + starter content (safe to re-run)
npm run dev        # http://localhost:3000
```

Sign in at <http://localhost:3000/admin> with `ADMIN_PASSWORD` from `.env.local`.

## Environment variables

| Name | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon connection string |
| `ADMIN_PASSWORD` | Password for `/admin` |
| `SESSION_SECRET` | 32+ random characters used to sign the admin session cookie |

## What the admin can edit

- **Site content**: name, hero line, availability badge, profile/about photos, marquee keywords, section headings, about text, skill groups, contact email, social links, SEO and footer.
- **Projects**: title, URL slug, summary, tags, cover, gallery, case-study text, year/client/role, live link, draft/published, featured, and order. Every project gets its own page at `/work/<slug>`.
- **Illustrations**: image, title, caption, background colour, published, and order. Clicking one opens a lightbox.
- **Media library**: drag-and-drop bulk upload. Large photos are resized in the browser to 2400px WebP before upload.

Saving revalidates the public pages, so changes go live straight away.

## How it's built

- `app/(site)`: the public site (`site.css` is a port of the original HTML's styles).
- `app/admin`: the admin panel and server actions (`actions.ts`), each checking the session.
- `proxy.ts`: blocks `/admin` and `/api/admin` without a valid session.
- `app/api/media/[id]`: serves images from the `media` table with immutable caching.
- `scripts/setup-db.mjs`: schema and seed data.

Images are stored in Postgres (`bytea`), so there's no extra storage service. That works well for portfolio-sized libraries. If you later have hundreds of large images, move them to object storage such as Vercel Blob or S3.

## Deploy (Vercel)

1. Push to GitHub and import the repo in Vercel.
2. Add the three environment variables above.
3. Deploy. The build reads from the database, so run `npm run db:setup` once beforehand.
