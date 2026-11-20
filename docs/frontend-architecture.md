# Frontend architecture

## Tenant and routing

`src/lib/tenant.ts` defines Lugari, its six wards and tenant features. The site shell and listing logic consume this configuration. Public static routes are generated from the navigation registries and catalog. The App Router dispatcher resolves ward, resource, public screen and workspace layouts. A second tenant would need its own configuration, tenant-scoped data sources, local storage namespace and canonical deployment origin.

## Data and state

`src/services/catalog.ts` defines a read contract for listing, lookup and search. The bundled adapter uses `src/data/`. Resource models and status types live in `src/lib/types.ts`. Components consume catalog results and reusable cards, charts, forms and layouts.

`src/services/local.ts` implements browser-local simulation state through React’s external-store interface. Reports, workflow entries and approvals share this store so the public tracker, institution workspace and platform admin can demonstrate connected workflows. Public case views render a narrow projection of category, ward, reference and public updates. Demo roles restrict which panels appear. Anyone with access to the browser can inspect that browser’s local storage. Use only sample data until server-side authorization and storage are connected.

## Static export and offline

The build emits a pre-rendered page for each catalog record and documented screen. New demo case references use a query parameter on the static tracking page. A live service can serve `/report/status/[reference]` dynamically once it can look up case references. The service worker caches only an offline screen, icons and metadata. Navigation is otherwise network-first.

## Verification

Playwright covers report submission and triage, contact privacy in the public status view, campaign approval, role navigation, directory filters, saving, subscriptions, global search and mobile widths. Media and metadata are verified against the static production output.
