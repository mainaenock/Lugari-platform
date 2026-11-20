import { constituencySource, countySource } from '@/lib/tenant';
import type { AgriculturePrice, Resource, ResourceKind } from '@/lib/types';
import { photo, projects } from './projects';

export const officialBursary = 'https://lugari.ngcdf.go.ke/wp-content/uploads/2021/07/LUGARI-CDF-BURSARY-APPLICATION-FORM.pdf';
export const demoSource = { name: 'Illustrative platform dataset' };
type DemoRow = [slug: string, title: string, category: string, ward: string, summary: string, extra?: Partial<Resource>];
const demo = (kind: ResourceKind, rows: DemoRow[]): Resource[] => rows.map(([slug, title, category, ward, summary, extra]) => ({
  kind, slug, title, category, ward, summary, trust: 'Demo data', source: demoSource, ...extra,
}));

const opportunities = demo('opportunities', [
  ['mathematics-teaching-assistant', 'Mathematics Teaching Assistant', 'Job', 'lumakanda', 'Support small-group mathematics lessons and prepare learning materials for junior school pupils.', {
    organization: 'Example Lumakanda Learning Centre', deadline: '2026-12-04', keywords: ['teacher jobs', 'teaching', 'education', 'Diploma'],
    details: [{ heading: 'Eligibility', text: 'Diploma in education or a related field. The example role asks for experience supporting small classes.' }, { heading: 'Application steps', text: 'A live listing would link to the employer and give instructions for submitting a CV and references.' }],
  }],
  ['mautuma-dairy-apprenticeship', 'Dairy Cooperative Attachment', 'Attachment', 'mautuma', 'Spend eight weeks learning milk collection, recordkeeping and basic quality checks.', {
    organization: 'Example Mautuma Dairy Group', deadline: '2026-12-11', keywords: ['Agriculture', 'certificate', 'internship'],
  }],
  ['technical-training-scholarship', 'Technical Training Scholarship', 'Scholarship', 'chevaywa', 'A model scholarship for young adults interested in electrical installation, masonry or plumbing.', {
    deadline: '2027-01-08', organization: 'Example Skills Fund', keywords: ['Technical', 'youth', 'KCSE'],
  }],
  ['produce-handling-short-course', 'Fresh Produce Handling Short Course', 'Training', 'chekalini', 'Learn sorting, storage and practical ways to reduce losses after harvest.', { deadline: '2026-12-03', organization: 'Example Harvest Network', keywords: ['Agriculture'] }],
  ['community-records-intern', 'Community Records Internship', 'Internship', 'lwandeti', 'Work with an example community organization to maintain records and digitize its resource directory.', { deadline: '2026-12-10', organization: 'Example Community Learning Trust' }],
  ['rainwater-tank-supply', 'Supply of Rainwater Tanks', 'Tender', 'lugari', 'An example procurement listing for supplying and delivering tanks to participating facilities.', { deadline: '2026-12-18', organization: 'Example Works Team' }],
  ['youth-enterprise-grant', 'Youth Enterprise Equipment Grant', 'Grant', 'mautuma', 'An example grant for groups that need shared equipment to start earning income.', { deadline: '2027-01-20', organization: 'Example Youth Enterprise Network' }],
  ['junior-engineering-club', 'Junior Engineering Club', 'Youth programme', 'lugari', 'An example weekend programme for building simple models and learning basic design skills.', { deadline: '2027-01-15', organization: 'Example Makers Circle' }],
  ['school-transport-dispatcher', 'School Transport Dispatcher', 'Job', 'lwandeti', 'An example role coordinating vehicle schedules and communicating pickup changes.', { deadline: '2026-12-15', organization: 'Example Western Transport' }],
  ['farm-input-collective-order', 'Farm Input Group Ordering', 'Agriculture', 'chevaywa', 'An example of how producer groups can register interest in a collective order.', { deadline: '2026-12-12', organization: 'Example Growers Hub' }],
]);

const bursary: Resource = {
  kind: 'opportunities', slug: 'lugari-ng-cdf-bursary-guide', title: 'Lugari NG-CDF Bursary Guide', category: 'Bursary',
  trust: 'Official source', organization: 'Lugari NG-CDF', source: { name: 'Lugari NG-CDF application form', url: officialBursary },
  summary: 'Find the official Lugari NG-CDF bursary form and check current intake dates and requirements with the constituency office.',
  keywords: ['financing', 'school fees', 'education', 'student'], href: officialBursary,
  details: [{ heading: 'Before you apply', text: 'Confirm the current intake, eligibility and submission point on the official site. The form linked here is a publicly available reference copy.' }, { heading: 'Submitting documents', text: 'Use the official submission process. Keep copies of your documents and any acknowledgement from the office.' }],
};

const schools: Resource[] = [
  ...projects.filter(project => project.category === 'Education' && project.trust === 'Source reported').map(project => ({
    kind: 'schools' as const, slug: project.slug, title: project.title.replace(/ (Classrooms|Construction|Building)$/, ''),
    summary: 'Find the published source and development records for this school. Contact and enrolment details are unavailable in this directory.',
    category: project.title.includes('High School') ? 'Secondary' : 'Primary & junior school', ward: project.ward,
    trust: project.trust, source: project.source, image: project.image, date: project.date, location: project.location,
  })),
  { kind: 'schools', slug: 'lake-basin-comprehensive-school', title: 'Lake Basin Comprehensive School', category: 'Primary & junior school', ward: 'lugari', trust: 'Source reported', date: '2025-03-13',
    summary: 'A March 2025 public post documented eight classrooms described as ready for handover.',
    source: { name: 'Nabii Nabwera public page', url: 'https://www.facebook.com/photo/?fbid=1095668812571722&set=a.313737234098221' } },
];

const businesses = demo('businesses', [
  ['mulembe-farm-supply', 'Mulembe Farm Supply', 'Agrovet', 'lumakanda', 'A sample farm supplies shop with seeds, livestock feeds and tools for smallholder farmers.', { keywords: ['farming', 'feeds', 'seeds'], location: 'Lumakanda market area', details: [{ heading: 'Sample opening hours', text: 'Monday to Saturday, 8 am to 6 pm.' }] }],
  ['kijani-dairy-collection', 'Kijani Dairy Collection', 'Agriculture', 'mautuma', 'A sample milk collection and quality testing point for smallholder dairy producers.', { keywords: ['dairy cow', 'milk'] }],
  ['mugumo-table', 'Mugumo Table', 'Restaurant', 'chekalini', 'An example of a local eatery serving daily lunch and tea.'],
  ['western-timber-and-tools', 'Western Timber & Tools', 'Hardware', 'lwandeti', 'A sample building supplies listing for timber, fasteners and hand tools.'],
  ['ridge-motor-works', 'Ridge Motor Works', 'Mechanic', 'chevaywa', 'A sample workshop listing for motorcycle servicing and repairs.'],
  ['lugari-stitch-studio', 'Lugari Stitch Studio', 'Tailoring', 'lugari', 'A sample tailoring workshop for repairs, alterations and school uniforms.'],
]);

const events = demo('events', [
  ['mautuma-youth-skills-forum', 'Mautuma Youth Skills Forum', 'Youth activity', 'mautuma', 'A sample forum about apprenticeships, vocational training and building a portfolio.', { date: '2026-12-05', location: 'Mautuma community meeting space', organization: 'Example Makers Circle' }],
  ['chekalini-growers-meetup', 'Chekalini Growers Meetup', 'Training', 'chekalini', 'A sample knowledge-sharing session about soils, seed selection and produce handling.', { date: '2026-12-12', location: 'Chekalini market area', organization: 'Example Growers Hub' }],
  ['lumakanda-open-budget-session', 'Lumakanda Open Budget Session', 'Public participation', 'lumakanda', 'An example agenda for reviewing community priorities for local infrastructure.', { date: '2026-12-16', location: 'Lumakanda', organization: 'Example Civic Forum' }],
  ['lwandeti-community-sports-day', 'Lwandeti Community Sports Day', 'Sports', 'lwandeti', 'Sample football and volleyball sessions for community teams.', { date: '2027-01-09', location: 'Lwandeti sports grounds', organization: 'Example Youth Enterprise Network' }],
]);

export const stories: Resource[] = [
  { kind: 'news', slug: 'get-to-know-your-lugari-ward', title: 'Get to know your Lugari ward', category: 'Community', date: '2026-11-20',
    summary: 'Lugari has six wards. Use the ward directory to find local development records and take part in community conversations.',
    trust: 'Official source', source: { name: 'County Government of Kakamega', url: countySource },
    details: [{ heading: 'The six wards', text: 'Lumakanda, Lugari, Mautuma, Chekalini, Chevaywa and Lwandeti make up Lugari constituency.' }] },
  { kind: 'news', slug: 'finding-lugari-bursary-information', title: 'Where to find Lugari bursary information', category: 'Education', date: '2026-11-20',
    summary: 'Start with the official application form and confirm the current intake before sending any documents.',
    trust: 'Official source', source: { name: 'Lugari NG-CDF', url: officialBursary } },
  { kind: 'news', slug: 'football-tournament-launch-2022', title: 'From the archive: Lugari football tournament launch', category: 'Sports', date: '2022-12-26',
    summary: 'Photos from December 2022 show residents gathered for the launch of a local football tournament.',
    trust: 'Source reported', source: { name: 'Nabii Nabwera public page', url: 'https://www.facebook.com/HonNabiiNabwera/posts/pfbid0EB7rQfACh8MF9DEizS3vmkCJKsyeKsHvMqwq9X72CJgDHBKkGT8Mstn3pEUy78vNl' },
    image: photo('football', 'Residents gathered around an outdoor field during the Lugari football tournament launch') },
  { kind: 'news', slug: 'ward-volleyball-archive', title: 'From the archive: Volleyball picks up at ward level', category: 'Sports', date: '2023-12',
    summary: 'A December 2023 photo update documented a ward volleyball tournament round.',
    trust: 'Source reported', source: { name: 'Nabii Nabwera public page', url: 'https://www.facebook.com/HonNabiiNabwera/posts/pfbid0vFYg2EwN7Y2sCNVEjhmsKEH9NRs8jugJ78ioPaSjH9Xgvn4qvrQxR2ebXzSxeYTjl' },
    image: photo('volleyball', 'Players on opposite sides of a net during an outdoor Lugari volleyball match') },
];

const organizations: Resource[] = [
  { kind: 'organizations', slug: 'lugari-ng-cdf', title: 'Lugari NG-CDF', category: 'Public office', ward: 'lumakanda', trust: 'Official source',
    source: { name: 'Official constituency website', url: 'https://lugari.ngcdf.go.ke/' }, summary: 'Constituency development fund information, bursary forms and historical project records.' },
  { kind: 'organizations', slug: 'kakamega-county-government', title: 'County Government of Kakamega', category: 'County government', trust: 'Official source',
    source: { name: 'County Government of Kakamega', url: 'https://kakamega.go.ke/' }, summary: 'County public services, development notices, plans and public participation information.' },
  ...demo('organizations', [
    ['example-growers-hub', 'Example Growers Hub', 'Community organization', 'chevaywa', 'A sample farmer-led organization profile for sharing training dates and aggregation notices.'],
    ['example-makers-circle', 'Example Makers Circle', 'Youth organization', 'mautuma', 'A sample youth organization profile with technical skills meetings and apprenticeship updates.'],
  ]),
];

export const resources: Resource[] = [
  ...projects, bursary, ...opportunities, ...schools, ...businesses, ...events, ...organizations, ...stories,
  ...demo('marketplace', [
    ['dairy-cow-mautuma', 'Dairy Cow · Mautuma', 'Livestock', 'mautuma', 'Sample listing for a mature dairy cow. Always inspect livestock and paperwork before payment.', { price: 85000, date: '2026-11-17', keywords: ['milk', 'heifer'] }],
    ['white-maize-sacks', 'White Maize · 90 kg Bags', 'Farm produce', 'lumakanda', 'Sample dry maize offer for buyers comparing local listings.', { price: 3950, date: '2026-11-19' }],
    ['portable-chaff-cutter', 'Portable Chaff Cutter', 'Equipment', 'chevaywa', 'Sample second-hand equipment listing for small dairy farms.', { price: 21500, date: '2026-11-13' }],
    ['market-display-table', 'Market Display Table', 'Furniture', 'lwandeti', 'Sample locally made table for market stalls.', { price: 4200, date: '2026-11-15' }],
  ]),
  ...demo('talent', [
    ['kavuli-electrical', 'Kavuli Electrical Services', 'Electrician', 'mautuma', 'Sample profile for lighting, basic wiring and solar maintenance.', { status: 'Available by appointment' }],
    ['mirembe-joinery', 'Mirembe Joinery', 'Carpenter', 'lwandeti', 'Sample portfolio for desks, cabinets and repairs.', { status: 'Accepting new enquiries' }],
    ['jua-studio', 'Jua Story Studio', 'Photographer', 'lumakanda', 'Sample profile for community events and small-business photography.', { status: 'Available on weekends' }],
  ]),
  ...demo('public-participation', [
    ['mautuma-market-access', 'Mautuma Market Access Priorities', 'Community priority survey', 'mautuma', 'Share which access improvements would help residents use the market more easily.', { status: 'Open consultation', deadline: '2026-12-20' }],
    ['chekalini-water-access', 'Chekalini Water Access Proposal', 'Community proposal', 'chekalini', 'Review a sample proposal for improving access paths and signage near public water points.', { status: 'Open consultation', deadline: '2026-12-22' }],
    ['lumakanda-walking-routes', 'Safe Walking Routes Near Schools', 'Consultation', 'lumakanda', 'A sample consultation about crossings, drainage and walking routes.', { status: 'Open consultation', deadline: '2027-01-10' }],
  ]),
  ...demo('commitments', [
    ['mautuma-market-drainage', 'Improve Drainage Around the Market', 'Infrastructure', 'mautuma', 'Illustrative commitment to improve drainage and access around a trading centre.', { organization: 'Example Works Team', status: 'In progress', date: '2026-09-01' }],
    ['lwandeti-skills-calendar', 'Publish a Seasonal Skills Calendar', 'Education', 'lwandeti', 'Illustrative commitment to publish training sessions on a single calendar.', { organization: 'Example Community Learning Trust', status: 'Completed', date: '2026-11-11' }],
  ]),
  ...demo('alerts', [
    ['water-service-example', 'Water Service Interruption Example', 'Water outage', 'chekalini', 'An archived demonstration of how a water outage notice appears when its source and date are available.', { status: 'Archived', date: '2026-10-21' }],
  ]),
];

export const prices: AgriculturePrice[] = [
  { product: 'White maize', market: 'Lumakanda', price: 3950, unit: '90 kg bag', date: '2026-11-18' },
  { product: 'Dry beans', market: 'Chekalini', price: 118, unit: 'kg', date: '2026-11-18' },
  { product: 'Fresh milk', market: 'Mautuma', price: 52, unit: 'litre', date: '2026-11-19' },
  { product: 'Tomatoes', market: 'Lwandeti', price: 75, unit: 'kg', date: '2026-11-16' },
  { product: 'Mature dairy cow', market: 'Lugari', price: 85000, unit: 'head', date: '2026-10-20' },
];

export const references = [
  { name: 'Lugari NG-CDF · Constituency and wards', url: constituencySource },
  { name: 'County Government of Kakamega · Constituency directory', url: countySource },
  { name: 'Lugari NG-CDF · Historical project implementation status', url: 'https://lugari.ngcdf.go.ke/wp-content/uploads/2023/10/lugari.pdf' },
  { name: 'Lugari NG-CDF · Bursary form', url: officialBursary },
  { name: 'Nabii Nabwera public page · Historical project posts', url: 'https://www.facebook.com/HonNabiiNabwera' },
];
