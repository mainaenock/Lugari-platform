import Link from '@/components/link';
import type { ReactNode } from 'react';
import { CalendarDays, ClipboardList, Landmark, Radio, WifiOff } from 'lucide-react';
import { tenant, constituencySource, countySource } from '@/lib/tenant';
import { directories, isDirectory, publicPages } from '@/lib/routes';
import { catalog } from '@/services/catalog';
import { prices, references, officialBursary } from '@/data/resources';
import { formatDate, money } from '@/lib/format';
import { AdEstimate, CorrectionIntake, IssueMetrics, UssdSimulator } from '@/components/utilities';
import { CaseTracker, IntakeForm, ReportForm } from '@/components/engagement';
import { LocalAnnouncements } from './editors';
import { PrivacyCenter, SignIn } from '@/components/resident';
import { Browse, SearchResults } from '@/components/browse';
import { BarChart, Metric, PageHeading, ResourceGrid, SectionHeading, TrustBadge } from '@/components/content';

const parliament = 'https://www.parliament.go.ke/the-national-assembly/hon-nabii-nabwera-daraja';
function panel(title: string, text: string, label?: string, href?: string) {
  return <article className="panel flow-tight" key={title}><h2 className="text-xl">{title}</h2><p className="muted">{text}</p>{href && (href.startsWith('/') ? <Link className="text-link" href={href}>{label}</Link> : <a className="text-link" href={href}>{label}</a>)}</article>;
}

function DirectoryPage({ kind }: { kind: keyof typeof directories }) {
  const page = directories[kind];
  return <><PageHeading title={page.title} intro={page.intro}>
    {kind === 'projects' && <Link className="chip" href="/data/projects/">View project ledger</Link>}
    {kind === 'opportunities' && <><Link className="chip" href="/jobs/">Jobs</Link><Link className="chip" href="/education/">Bursaries and education</Link><Link className="chip" href="/account/subscriptions/">Set alerts</Link></>}
    {kind === 'public-participation' && <Link className="chip" href="/appointments/">Request an appointment</Link>}
    {kind === 'alerts' && <Link className="chip" href="/account/subscriptions/">Subscribe to critical alerts</Link>}
  </PageHeading><div className="wrap section flow">
    {kind === 'alerts' && <p className="notice">No active critical notices are listed here. For urgent danger or suspected crime, contact emergency authorities directly.</p>}
    {kind === 'marketplace' && <p className="notice">These are sample listings. Inspect goods and verify ownership before paying in a live transaction.</p>}
    <Browse kind={kind} />
  </div></>;
}
function Education() {
  return <>
    <section className="panel flow"><div className="chip-row"><TrustBadge trust="Official source" /></div><h2>Lugari NG-CDF bursaries</h2><p>Use the official form as a reference. Confirm current application dates, eligibility and submission instructions with Lugari NG-CDF.</p>
      <div className="button-row"><a className="btn" href={officialBursary}>View official bursary form</a><Link className="text-link" href="/account/subscriptions/">Set bursary reminders</Link></div></section>
    <section className="flow-tight"><SectionHeading title="Scholarships and training" href="/opportunities/" /><ResourceGrid items={catalog.list('opportunities').filter(item => ['Scholarship', 'Training', 'Attachment'].includes(item.category))} /></section>
    <section className="flow-tight"><SectionHeading title="Find a school" href="/schools/" link="School directory" /><ResourceGrid items={catalog.list('schools').slice(0, 3)} /></section>
    <section className="panel flow-tight"><h2>Questions about applying</h2>
      <details><summary className="min-h-11 font-bold">When is the next bursary deadline?</summary><p>Check the official intake notice or contact the constituency office. Application windows can change.</p></details>
      <details><summary className="min-h-11 font-bold">Where do I submit documents?</summary><p>Use the process announced by the official administrator. Lugari.ke links to the form and does not collect application documents.</p></details>
    </section>
  </>;
}
function Agriculture() {
  return <>
    <section className="panel flow"><h2>Local market prices</h2><div className="data-table"><table><caption>Demo data · Illustrative prices from a sample market survey</caption>
      <thead><tr>{['Product', 'Market', 'Price', 'Recorded', 'Source'].map(header => <th key={header} scope="col">{header}</th>)}</tr></thead>
      <tbody>{prices.map(row => <tr key={row.product}><th scope="row">{row.product}</th><td>{row.market}</td><td>{money(row.price)} / {row.unit}</td><td>{formatDate(row.date)}{row.date < '2026-11-01' && <><br/><span className="status" data-tone="warm">Example · Outdated</span></>}</td><td>Sample survey</td></tr>)}</tbody>
    </table></div></section>
    <section><SectionHeading title="Farm training and attachments" href="/opportunities/?category=Agriculture" /><ResourceGrid items={catalog.list('opportunities').filter(item => item.keywords?.includes('Agriculture') || item.category === 'Agriculture')} /></section>
    <section className="grid">{[
      panel('Agrovets and farm supplies', 'Browse the directory for seeds, feeds and equipment.', 'Find an agrovet', '/businesses/?category=Agrovet'),
      panel('Livestock and produce', 'Compare the example listings and inspect items before payment.', 'Open the marketplace', '/marketplace/'),
      panel('Agricultural extension', 'Use the county website for published contacts and agricultural programmes.', 'County Government of Kakamega', 'https://kakamega.go.ke/'),
    ]}</section>
  </>;
}

function Ledger({ all = false }: { all?: boolean }) {
  const projects = catalog.list('projects').filter(item => item.trust !== 'Demo data');
  const total = catalog.list();
  const categories = [...new Set(projects.map(item => item.category))];
  const statuses = [...new Set(projects.map(item => item.status ?? 'Unavailable'))];
  const years = [...new Set(projects.map(item => item.date?.slice(0, 4) ?? 'Unknown'))].sort();
  return <>
    <p className="notice">Counts reflect selected records in this directory. Project statuses are historical and may differ from their current state.</p>
    <div className="metric-grid">
      <Metric value={tenant.wards.length} label="Wards" detail="Lugari NG-CDF" />
      <Metric value={projects.length} label="Sourced development records" detail="Supplied photo archive and county posts" />
      <Metric value={projects.filter(item => item.status === 'Completed').length} label="Reported completed" detail="Historical source status" />
      <Metric value={projects.filter(item => item.price !== undefined).length} label="Published project values" detail="Project records in this directory" />
    </div>
    <p className="small muted">Directory snapshot · 20 November 2026</p>
    <div className="grid two">
      <BarChart name="Project records by ward" rows={[...tenant.wards.map(ward => [ward.name, projects.filter(item => item.ward === ward.slug).length] as [string, number]), ['Ward unavailable', projects.filter(item => !item.ward).length]]} />
      <BarChart name="Project records by category" rows={categories.map(category => [category, projects.filter(item => item.category === category).length])} />
      <BarChart name="Status at the time of publication" rows={statuses.map(status => [status, projects.filter(item => item.status === status).length])} />
      <BarChart name="Reported completions by source year" rows={years.map(year => [year, projects.filter(item => item.status === 'Completed' && item.date?.startsWith(year)).length])} />
      <BarChart name="Published project records by year" rows={years.map(year => [year, projects.filter(item => item.date?.startsWith(year)).length])} />
    </div>
    <section className="panel flow">
      <h2>Published allocations</h2>
      <div className="data-table"><table><caption>Historical figures from the source listed on each project</caption>
        <thead><tr><th scope="col">Project</th><th scope="col">Allocation</th></tr></thead>
        <tbody>{projects.filter(item => item.price !== undefined).map(item => <tr key={item.slug}><th scope="row"><Link className="text-link" href={'/projects/' + item.slug + '/'}>{item.title}</Link></th><td>{money(item.price!)}</td></tr>)}</tbody>
      </table></div>
    </section>
    {all && <div className="grid two"><BarChart name="Directory coverage" rows={(['schools', 'opportunities', 'businesses', 'events'] as const).map(kind => [directories[kind].title, total.filter(item => item.kind === kind).length])} />{panel('Community reports', 'See anonymized figures from the demonstration workflow.', 'Open community issues', '/community/issues/')}</div>}
    <div className="button-row"><Link className="btn" href="/projects/">Browse projects</Link><Link className="quiet-button" href="/sources/">Data sources</Link><Link className="quiet-button" href={all ? '/data/projects/' : '/reports/state-of-lugari/'}>{all ? 'Project ledger' : 'Annual report'}</Link></div>
  </>;
}

function Leadership({ profile = false }: { profile?: boolean }) {
  if (profile) return <>
    <section className="panel flow"><TrustBadge trust="Official source" /><h2>Nabii Nabwera Daraja</h2><p>Lugari’s elected Member of Parliament, as listed by the constituency’s NG-CDF office.</p><a className="text-link" href={constituencySource}>Open the official constituency page</a></section>
    <div className="grid two">{panel('Public office', 'Find official parliamentary contact information and constituency office notices.', 'Kenya National Assembly', parliament)}{panel('Public calendar', 'Check public events and meeting notices in the community calendar.', 'Find events', '/events/')}</div>
  </>;
  return <div className="grid">{[
    panel('Member of Parliament', 'Find the office holder and official links for the constituency.', 'MP office profile', '/leadership/mp/'),
    panel('Ward representation', 'Find wards and the county directory, which links to ward and public office information.', 'Browse the wards', '/wards/'),
    panel('County and local administration', 'Use the county directory for public offices and service contacts.', 'County constituency directory', countySource),
  ]}</div>;
}

function Community({ sports = false }: { sports?: boolean }) {
  const stories = catalog.list('news').filter(item => !sports || item.category === 'Sports');
  return <>
    <section><SectionHeading title={sports ? 'Lugari sports archive' : 'Local stories'} href="/news/" link="All updates" /><ResourceGrid items={stories} /></section>
    {sports ? <section className="panel flow"><h2>Community fixtures</h2><p className="notice">The fixture below is demonstration data. Check published organisers’ notices for live fixtures.</p><ResourceGrid items={catalog.list('events').filter(item => item.category === 'Sports')} /></section> : <div className="grid two">
      {panel('Lugari’s six wards', 'Read about the constituency and its wards in the official directory, or explore the ward pages for community information.', 'Explore wards', '/wards/')}
      {panel('Sports and youth activities', 'See archived community sports coverage and example fixtures.', 'Sports in Lugari', '/sports/')}
    </div>}
  </>;
}
function DataSources() {
  return <><div className="panel flow"><h2>Reference sources</h2><ul className="list-disc pl-6">{references.map(source => <li key={source.url}><a className="text-link" href={source.url}>{source.name}</a></li>)}</ul></div>
    <div className="grid">{[
      panel('Official source', 'The record links to a public institution’s published material. Check the publication date and scope.'),
      panel('Source reported', 'The record is based on a named publication or photo update. The status describes what was publicly reported at the time.'),
      panel('Demo data', 'Illustrative entries show how a feature works. They are marked with this label and should be used with sample details only.'),
    ]}</div></>;
}
function AnnualReport() {
  return <><p className="notice">2026 demonstration edition · An overview of the platform’s directory and archived sources.</p>
    <div className="grid">{[
      panel('Education', 'Explore sourced school profiles and the guide to official bursary information.', 'Bursaries and education', '/education/'),
      panel('Development', 'View selected infrastructure records and photos with dated sources.', 'Project ledger', '/data/projects/'),
      panel('Work and training', 'Explore model listings and how application deadlines will appear.', 'Opportunities', '/opportunities/'),
      panel('Local economy', 'Browse business and farm listings in the directory.', 'Agriculture', '/agriculture/'),
      panel('Youth and community', 'Read about community sports and public participation.', 'Sports', '/sports/'),
      panel('Community concerns', 'View anonymized demo report counts and resolution status.', 'Community issues', '/community/issues/'),
    ]}</div><a className="btn" href="/state-of-lugari-2026.txt" download>Download sample report</a></>;
}
function ExtraContent({ path }: { path: string }): ReactNode {
  switch (path) {
    case 'search': return <SearchResults />;
    case 'jobs': return <Browse kind="opportunities" fixedCategory="Job" />;
    case 'education': return <Education />;
    case 'report': return <><Link className="text-link" href="/report/status/">Track an existing report</Link><ReportForm /></>;
    case 'report/status': return <CaseTracker />;
    case 'report/status/LUG-84721': return <CaseTracker sample />;
    case 'community/issues': return <IssueMetrics />;
    case 'community': return <Community />;
    case 'sports': return <Community sports />;
    case 'leadership': return <Leadership />;
    case 'leadership/mp': return <Leadership profile />;
    case 'data': return <Ledger all />;
    case 'data/projects': return <Ledger />;
    case 'announcements': return <><LocalAnnouncements /><ResourceGrid items={catalog.list('news').filter(item => item.trust === 'Official source')} /><Link className="text-link" href="/news/">Read all news and stories</Link></>;
    case 'agriculture': return <Agriculture />;
    case 'access/ussd': return <UssdSimulator />;
    case 'advertise': return <><div className="grid">{[panel('Directory listing', 'Help residents discover a service by name, category or ward.'), panel('Featured placement', 'Highlight an offer on the homepage or directory with a visible Sponsored label.'), panel('Opt-in messages', 'Estimate ward or interest reach for SMS and WhatsApp campaigns.') ]}</div><p className="notice"><TrustBadge trust="Sponsored" /> Paid placements use a visible disclosure. Estimates below use demo pricing and audience counts.</p><AdEstimate /></>;
    case 'appointments': return <><p className="notice">Appointment requests are simulated. For a real appointment, contact the office directly.</p><IntakeForm bucket="appointment" label="Request an appointment" /><Link className="text-link" href="/leadership/">Find public office information</Link></>;
    case 'corrections': return <><div className="panel flow-tight"><h2>Public correction log</h2><p className="muted">No published corrections are recorded in this directory.</p></div><CorrectionIntake /></>;
    case 'sources': return <DataSources />;
    case 'privacy': return <PrivacyCenter />;
    case 'reports/state-of-lugari': return <AnnualReport />;
    case 'live': return <><div className="panel flow"><Radio size={26}/><h2>No live broadcast now</h2><p>See the public calendar for sample sessions and meeting times.</p><Link className="btn" href="/events/">Open events</Link></div><SectionHeading title="Previous community coverage" /><ResourceGrid items={catalog.list('news').filter(item => item.category === 'Sports')} /></>;
    case 'offline': return <div className="panel flow"><WifiOff size={28} /><h2>Check your connection</h2><Link className="btn" href="/">Try the homepage</Link></div>;
    case 'sign-in': return <SignIn />;
    case 'register': return <SignIn registration />;
    case 'contact': return <><div className="grid two">{panel('Constituency information', 'For official services use Lugari NG-CDF or the relevant government office.', 'Lugari NG-CDF website', 'https://lugari.ngcdf.go.ke/')}{panel('Corrections and updates', 'If you can identify a record that needs to change, send a correction with the relevant source.', 'Suggest a correction', '/corrections/')}</div><IntakeForm bucket="platform feedback" label="Share platform feedback" /></>;
    case 'about': return <div className="grid">{[
      panel('For residents', 'Find your ward, search opportunities and follow what is happening near you.', 'Find your ward', '/wards/'),
      panel('For businesses', 'Discover how people can find local services by ward and category.', 'Browse businesses', '/businesses/'),
      panel('For institutions', 'Explore the demonstration workspace for cases, development and communications.', 'Demo workspaces', '/sign-in/'),
    ]}</div>;
    case 'terms': return <div className="grid two">{[
      panel('Responsibility for public information', 'Use the dated source links to confirm official deadlines, eligibility and decisions. Example records are marked in the directory.', 'Data sources', '/sources/'),
      panel('Community submissions', 'Describe what you witnessed and leave out names or other private details. Content may require review before publication.', 'Privacy centre', '/privacy/'),
      panel('Local listings', 'Verify sellers, availability and terms directly before you make a decision or payment. The platform handles no payments.', 'Marketplace', '/marketplace/'),
      panel('Changes and corrections', 'Use the corrections form to share a source that supports a change.', 'Corrections', '/corrections/'),
    ]}</div>;
    case 'accessibility': return <><div className="grid two">{panel('Using the site', 'Use the skip link, keyboard navigation and visible focus indicators to explore the site. The layout responds to device width and browser text settings.')}{panel('Display preferences', 'Use the header to change theme, language or enable Data Saver. Motion is reduced if your device requests it.')}</div><IntakeForm bucket="accessibility feedback" label="Report an accessibility issue" includeWard={false} /></>;
    default: return null;
  }
}
export function PublicPage({ path }: { path: string }) {
  if (isDirectory(path)) return <DirectoryPage kind={path} />;
  const [title, intro] = publicPages[path];
  const narrow = ['report', 'report/status', 'report/status/LUG-84721', 'privacy', 'appointments', 'corrections', 'offline'].includes(path);
  const icon = path === 'events' ? <CalendarDays/> : path.startsWith('report') ? <ClipboardList/> : path === 'leadership' ? <Landmark/> : null;
  return <><PageHeading title={title} intro={intro}>{icon}</PageHeading><div className={(narrow ? 'narrow' : 'wrap') + ' section flow'}><ExtraContent path={path} /></div></>;
}
