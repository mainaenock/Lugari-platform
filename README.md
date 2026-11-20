# Lugari Digital Infrastructure

Lugari.ke is an independent community platform for Lugari constituency in Kakamega County, Kenya. Its public directories bring together sourced development records, ward information, schools, opportunities and local services. Its demonstration workspaces connect resident reports with institutional case management and platform moderation.

## Run locally

Use Node.js 22 or newer.

```sh
npm ci
npm run dev
```

Open the local URL printed by Next.js. To build and preview the static production export, run:

```sh
npm run build
npm run preview
```

The preview serves `out/` on `http://127.0.0.1:4180/`.

## Verify

```sh
npm run typecheck
npm run lint
npm run build
npx playwright install chromium
npm test
```

If Chrome is already installed, set `PLAYWRIGHT_BROWSER_CHANNEL=chrome` when running `npm test`. On Windows PowerShell, use `$env:PLAYWRIGHT_BROWSER_CHANNEL = 'chrome'`.

## Try the connected workflows

From **Sign in**, open the resident, institution, or platform admin demo. The phone and email flows use sample verification code `123456`. Reports, subscriptions, saved items, publishing, moderation and campaigns persist in the same browser. Avoid using real personal or case information.

1. Choose Mautuma and open Lukusi Electricity Project for historical photos and attribution. Open Mautuma Market Drainage for the sample budget and progress treatment.
2. Submit a demo issue and keep its reference. In **Institution demo → Cases**, assign the case and write a public response. Open the public tracker to see the updated timeline.
3. Publish a draft announcement for Mautuma and view it on the Mautuma ward page. Create a campaign with SMS and WhatsApp previews, then approve it in **Platform admin demo → Advertising**. Return to the institution workspace to schedule the demo campaign.
4. View the weekly brief and inspect the administrator’s audit log.

## Deployment

The frontend exports HTML and static assets with Next.js App Router. For a Cloudflare Pages deployment, use the Next.js Static HTML Export preset with build command `npm run build` and output directory `out`. For Cloudflare Workers with static assets, serve the same output and configure the host to serve the route directories’ `index.html` files. The [Cloudflare Next.js static deployment guide](https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/) describes the Pages configuration. Cloudflare recommends [vinext](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/) when adding a Workers runtime for server-backed Next.js features.

Set `NEXT_PUBLIC_APP_URL` to the intended canonical public origin at build time. `NEXT_PUBLIC_TENANT_ID` defaults to `lugari`. `NEXT_PUBLIC_USE_MOCK_DATA` documents the demo integration boundary. The current distribution ships only the Lugari tenant and its catalog adapter. A production API adapter must be implemented before changing the data mode. Keep future API credentials in server configuration.

## Source and design

The application uses TypeScript, React, Tailwind CSS, Manrope, Lucide, React Hook Form and Zod. Project photography is drawn from the supplied archive and linked back to dated sources. Original uploads are retained outside `public/`. Regenerate the WebP variants with Python and Pillow using `python scripts/optimize-photos.py`. Archive notes and photos should be reviewed for publication rights before deploying publicly.

- [Route inventory](docs/route-map.md)
- [Frontend architecture](docs/frontend-architecture.md)
- [Backend contracts](docs/backend-contracts.md)
- [Design system](docs/design-system.md)
