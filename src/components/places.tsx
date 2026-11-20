import Link from '@/components/link';
import { MapPin } from 'lucide-react';
import { MapPanel, Metric, PageHeading, ResourceGrid, SectionHeading } from './content';
import { WardPicker } from './preferences';
import { LocalAnnouncements } from './editors';
import { catalog, wardLinks } from '@/services/catalog';
import { constituencySource, tenant, wardStatisticsSource, type Ward } from '@/lib/tenant';
import type { ResourceKind } from '@/lib/types';

const wardSections: [ResourceKind, string, string][] = [
  ['projects', 'Development projects', '/projects/'], ['opportunities', 'Jobs and training', '/opportunities/'],
  ['schools', 'Schools', '/schools/'], ['businesses', 'Local businesses', '/businesses/'],
  ['events', 'Community events', '/events/'], ['public-participation', 'Local consultations', '/public-participation/'],
  ['news', 'Community updates', '/news/'],
];
export function Wards() {
  return <><PageHeading title="Explore the wards" intro={'Choose a ward to find local projects, schools, events and services in ' + tenant.shortName + '.'}>
    <WardPicker />
  </PageHeading><section className="wrap section grid">{wardLinks().map(ward => {
    const projects = catalog.list('projects', ward.slug).filter(item => item.trust !== 'Demo data').length;
    return <article className="card" key={ward.slug}><div className="card-body">
      <span className="action-icon"><MapPin size={22} /></span><h3><Link href={ward.href}>{ward.name}</Link></h3><p className="muted">{ward.summary}</p><p className="small muted">{projects} sourced project {projects === 1 ? 'record' : 'records'} in this directory</p><Link className="text-link" href={ward.href}>Explore {ward.name}</Link>
    </div></article>;
  })}</section></>;
}

export function WardPage({ ward }: { ward: Ward }) {
  const items = catalog.list(undefined, ward.slug);
  return <>
    <PageHeading title={ward.name + ' Ward'} intro={ward.summary} parent={{ label: 'Wards', href: '/wards/' }}>
      <WardPicker initial={ward.slug} button="View ward" />
      <WardPicker initial={ward.slug} button="Save my ward" action="save" />
    </PageHeading>
    <div className="wrap section flow">
      <div className="metric-grid">
        <Metric value={items.filter(item => item.kind === 'projects' && item.trust !== 'Demo data').length} label="Sourced project records" detail="Historical updates" />
        <Metric value={items.filter(item => item.kind === 'schools').length} label="School profiles" detail="In this directory" />
        <Metric value={items.filter(item => item.kind === 'opportunities').length} label="Opportunities" detail="Includes demo records" />
        <Metric value={items.filter(item => item.kind === 'events').length} label="Events" detail="Includes demo records" />
      </div>
      {ward.approximatePopulation !== undefined && <section className="panel flow-tight">
        <h2 className="text-xl">Ward geography</h2>
        <p>Approx. {new Intl.NumberFormat('en-KE').format(ward.approximatePopulation)} residents and {ward.areaKm2} km² in the county’s 2015 profile.</p>
        <a className="text-link" href={wardStatisticsSource}>County ward statistics · Published October 2015</a>
      </section>}
      <LocalAnnouncements ward={ward.slug} />
      {wardSections.map(([kind, label, href]) => {
        const collection = items.filter(item => item.kind === kind);
        return <section className="section" key={kind}><SectionHeading title={label} href={href} />
          {collection.length ? <ResourceGrid items={collection} /> : <p className="muted">No {label.toLowerCase()} in this ward directory yet. Browse the constituency directory for more records.</p>}</section>;
      })}
      <section className="grid two">
        <MapPanel query={ward.name + ' Ward, ' + tenant.county} />
        <div className="panel flow-tight"><h2>Ward services</h2><p>Ward boundaries and names are published in the <a className="underline" href={constituencySource}>constituency directory</a>.</p>
          <div className="button-row"><Link className="text-link" href="/leadership/">Public offices</Link><Link className="text-link" href="/alerts/">Alerts</Link><Link className="text-link" href="/community/issues/">Issue statistics</Link><Link className="btn" href="/report/">Report an issue</Link></div>
        </div>
      </section>
    </div>
  </>;
}
