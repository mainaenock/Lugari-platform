import Link from '@/components/link';
import { Bell, BriefcaseBusiness, CalendarDays, CircleAlert, GraduationCap, Landmark, MapPin, Smartphone, Store } from 'lucide-react';
import { Metric, ResourceGrid, SectionHeading } from '@/components/content';
import { SearchBar } from '@/components/layout';
import { MyWardLink, Translate, WardPicker } from '@/components/preferences';
import { catalog } from '@/services/catalog';
import { tenant } from '@/lib/tenant';
import { heroPhoto } from '@/data/projects';

const shortcuts = [
  { label: 'Find jobs', href: '/jobs/', icon: BriefcaseBusiness },
  { label: 'Track projects', href: '/projects/', icon: Landmark },
  { label: 'Report an issue', href: '/report/', icon: CircleAlert },
  { label: 'Find a business', href: '/businesses/', icon: Store },
  { label: 'Bursaries', href: '/education/', icon: GraduationCap },
  { label: 'Upcoming events', href: '/events/', icon: CalendarDays },
  { label: 'My ward', href: '/wards/', icon: MapPin },
  { label: 'USSD access', href: '/access/ussd/', icon: Smartphone },
];

export const metadata = { alternates: { canonical: '/' } };
export default function Home() {
  const projects = catalog.list('projects').filter(item => item.trust !== 'Demo data');
  const schools = catalog.list('schools');
  const opportunities = catalog.list('opportunities');
  const reportedInProgress = projects.filter(item => item.status === 'In progress').length;
  return <>
    <section className="wrap hero" aria-labelledby="home-title">
      <div className="hero-copy">
        <p className="eyebrow dot">Lugari’s community platform</p>
        <h1 id="home-title"><Translate>Everything Lugari.</Translate><br/><em><Translate>One place.</Translate></em></h1>
        <p className="lead"><Translate>Find projects, jobs, businesses, schools and community updates from across Lugari.</Translate></p>
        <SearchBar />
        <WardPicker />
      </div>
      <figure className="hero-media" aria-label={heroPhoto.alt}>
        <figcaption><Link className="photo-credit" href="/projects/majengo-mugunga-road/"><MapPin size={15} aria-hidden="true" /> Majengo–Mugunga road works, Lugari</Link></figcaption>
      </figure>
    </section>
    <section className="wrap home-section" aria-labelledby="home-actions">
      <div className="section-head"><h2 id="home-actions"><Translate>Quick actions</Translate></h2></div>
      <div className="action-grid">{shortcuts.map(({ label, href, icon: Icon }) => {
        const content = <><span className="action-icon"><Icon size={21} aria-hidden="true" /></span><Translate>{label}</Translate></>;
        return label === 'My ward' ? <MyWardLink className="quick-action" key={href}>{content}</MyWardLink> : <Link className="quick-action" href={href} key={href}>{content}</Link>;
      })}</div>
    </section>
    <section className="wrap home-section">
      <SectionHeading title="Development in Lugari" intro="Follow the work, see the photos and check the original sources." href="/projects/" link="Browse projects" />
      <ResourceGrid items={projects.slice(0, 3)} />
      <div className="metric-grid mt-4">
        <Metric value={tenant.wards.length} label="Wards" detail="Official constituency directory" />
        <Metric value={projects.length} label="Sourced project records" detail="Selected historical updates" />
        <Metric value={reportedInProgress} label="Reported in progress" detail="At the time of publication" />
        <Metric value={schools.length} label="School profiles" detail="In this directory" />
      </div>
    </section>
    <section className="band home-section"><div className="wrap">
      <SectionHeading title="Start with your ward" intro="Local projects, schools, opportunities and events." href="/wards/" link="All wards" />
      <div className="chip-row">{tenant.wards.map(ward => <Link key={ward.slug} className="chip" href={'/wards/' + ward.slug + '/'}><MapPin size={15}/>{ward.name}</Link>)}</div>
    </div></section>
    <section className="wrap home-section">
      <SectionHeading title="Jobs, bursaries and training" intro="Check the source and application details before applying." href="/opportunities/" link="Find opportunities" />
      <ResourceGrid items={opportunities.slice(0, 3)} />
    </section>
    <section className="wrap home-section">
      <SectionHeading title="Latest local updates" href="/news/" link="Read more updates" />
      <ResourceGrid items={catalog.list('news').slice(0, 3)} />
    </section>
    <section className="wrap home-section grid two">
      <article className="panel flow-tight"><h2>Community concerns</h2><p className="muted">Report a damaged road, water problem or other local concern and keep your reference to check its status.</p>
        <div className="button-row"><Link className="text-link" href="/report/">Report an issue</Link><Link className="text-link" href="/community/issues/">Community dashboard</Link></div></article>
      <article className="panel flow-tight"><h2>Farming in Lugari</h2><p className="muted">Browse farm training, livestock listings, agrovets and examples of how local market prices are recorded.</p><Link className="text-link" href="/agriculture/">Agriculture hub</Link></article>
    </section>
    <section className="wrap home-section">
      <SectionHeading title="Community calendar" href="/events/" link="See all events" />
      <ResourceGrid items={catalog.list('events').slice(0, 3)} />
    </section>
    <section className="wrap home-section">
      <SectionHeading title="Local businesses" href="/businesses/" link="Open the directory" />
      <ResourceGrid items={catalog.list('businesses').slice(0, 3)} />
    </section>
    <section className="wrap home-section"><div className="callout">
      <div className="section-head"><div><p className="eyebrow"><Bell size={15}/> Ward alerts</p><h2>Stay connected to Lugari</h2><p className="lead">Choose the topics and channels you want to follow.</p></div><Link className="btn btn-amber" href="/account/subscriptions/">Set alert preferences</Link></div>
    </div></section>
  </>;
}
