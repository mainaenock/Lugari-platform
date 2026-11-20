# Route inventory

| Route | Purpose | Audience | Implementation |
| --- | --- | --- | --- |
| / | Search, shortcuts, ward choice, developments and updates | Public | Public landing |
| /wards and /wards/[slug] | Ward directory and ward-specific records | Public | Six sourced ward pages |
| /search | Grouped search and suggestions | Public | Catalog search |
| /projects and /projects/[slug] | Project directory, filters and sourced details | Public | Historical and illustrative records |
| /data and /data/projects | Directory overview and project charts | Public | Catalog counts |
| /opportunities and /opportunities/[slug] | Jobs, education, tender and training listings | Public | Official guide and demo records |
| /jobs and /education | Shortcuts for jobs, schools and bursary information | Public | Catalog and external sources |
| /schools, /businesses, /marketplace, /talent, /organizations, /events and their slug routes | Directories and detail pages | Public | Filterable records and demo interactions |
| /news and /news/[slug], /announcements | Stories and notices | Public | Sourced archive and local demo publishing |
| /public-participation and /public-participation/[slug] | Consultations and responses | Public | Local demo |
| /commitments and /commitments/[slug] | Track sample commitments | Public | Sample evidence and states |
| /alerts and /alerts/[slug] | Notices and alerts | Public | Archived example |
| /community, /sports, /live | Stories, fixtures and broadcasts index | Public | Archive and sample schedules |
| /community/issues | Anonymized case metrics | Public | Browser-local aggregate |
| /report | Guided report form and confirmation | Public | Local demo |
| /report/status and /report/status/LUG-84721 | Track public case status | Public, noindex | Dynamic references via query parameter |
| /leadership and /leadership/mp | Public office and parliamentary profiles | Public | Official links |
| /agriculture | Market prices and farm services | Public | Labelled price samples and directories |
| /appointments and /advertise | Appointment and advertising request forms | Public | Local demo and audience estimation |
| /access/ussd | Feature-phone simulator | Public | Local demo |
| /reports/state-of-lugari | Sample annual report | Public | Download and print |
| /privacy, /terms, /sources, /corrections, /about, /accessibility, /contact | Platform governance and feedback | Public | Informational pages and local forms |
| /offline | Offline experience | Public, noindex | Cached fallback |
| /sign-in, /register | Demo role and sample OTP | Public, noindex | Local demo |
| /account, /account/my-ward, /account/reports, /account/saved, /account/notifications, /account/settings | Resident tools | Resident demo, noindex | Local demo |
| /account/subscriptions, /account/privacy | Preferences and privacy | Public or resident, noindex | Local demo |
| /portal/dashboard, /portal/cases, /portal/projects, /portal/content, /portal/campaigns | Institution operations | Institution demo, noindex | Local demo |
| /portal/calendar, /portal/appointments, /portal/public-participation, /portal/ai-brief, /portal/analytics, /portal/team, /portal/media | Institutional tools | Institution demo, noindex | Local demo |
| /admin/dashboard, /admin/moderation, /admin/verification, /admin/ads, /admin/audit, /admin/tenants, /admin/media | Platform operations | Platform admin demo, noindex | Local demo |

`/portal/` and `/admin/` redirect to their dashboards. Demo-only detail records use noindex.
