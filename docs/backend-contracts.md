# Backend contracts

Endpoint names below describe future contracts. The frontend ships catalog and local demonstration adapters today.

| Endpoint | Contract |
| --- | --- |
| GET /v1/wards/:slug | Ward summary and published resource counts scoped to the tenant |
| GET /v1/projects | Cursor-paginated approved projects with ward, category, year, status and budget filters |
| GET /v1/projects/:slug | Scoped project details, milestones, source labels, gallery metadata and correction history |
| GET /v1/opportunities | Filtered listings with source URLs, deadlines and an expiry state |
| GET /v1/directory/:kind | Published directory results for schools, businesses, events, talent or organizations |
| GET /v1/search | Bounded query and grouped result DTOs with labels and canonical URLs |
| POST /v1/cases | Validated issue form, consent record, optional protected media IDs and idempotency key |
| GET /v1/cases/status/:reference | A limited public status projection with no reporter contacts, exact location, attachments or internal notes |
| PATCH /v1/institution/cases/:id | Authorized status, assignment, notes and response with revision checking |
| POST /v1/institution/campaigns | Draft message, tenant-scoped segment, channels and idempotency key |
| POST /v1/admin/campaigns/:id/decisions | Permission-checked approval or rejection with audit record |
| GET /v1/campaigns/estimate | Aggregate opted-in reach and price by ward, interest and channel |
| PUT /v1/account/subscriptions | Explicit topic, channel and marketing choices with consent version and timestamp |
| GET /v1/admin/audit | Paginated access-controlled audit entries with actor, action and before/after metadata |

Use authoritative server-side tenant and role resolution. Keep phone/email, report attachments and internal notes separate from public DTOs. Apply rate limits and validate writes at the boundary. Production media uploads should use restricted signed destinations and require media review. Campaign sends require queue-based delivery, independent approval, a current opt-in check and retry-safe idempotency. AI suggestions should carry a model/version, context and a reviewer decision.
