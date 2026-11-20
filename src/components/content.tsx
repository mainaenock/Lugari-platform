import type { ReactNode } from 'react';
import Link from '@/components/link';
import { BadgeCheck, CalendarDays, ChevronRight, MapPin, SearchX } from 'lucide-react';
import type { Resource, Trust } from '@/lib/types';
import { wardName } from '@/lib/tenant';
import { formatDate, money } from '@/lib/format';
import { resourceUrl } from '@/services/catalog';
import { DeadlineTag, LocalImage } from './preferences';

export function TrustBadge({ trust }: { trust: Trust }) {
  return <span className="status" data-tone={trust === 'Official source' ? 'blue' : trust === 'Sponsored' ? 'warm' : 'neutral'}>
    {trust === 'Official source' && <BadgeCheck size={14} aria-hidden="true" />}{trust}
  </span>;
}
export function SourceLabel({ source, date }: Pick<Resource, 'source' | 'date'>) {
  return <p className="rsrc-meta"><span>{source.url ? <a className="underline underline-offset-2" href={source.url}>{source.name}</a> : source.name}</span>{date && <time dateTime={date}>{formatDate(date)}</time>}</p>;
}
export function PageHeading({ title, intro, parent, children }: { title: string; intro?: string; parent?: { label: string; href: string }; children?: ReactNode }) {
  return <div className="page-top"><div className="wrap">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><ChevronRight size={13} aria-hidden="true" />
      {parent && <><Link href={parent.href}>{parent.label}</Link><ChevronRight size={13} aria-hidden="true" /></>}
      <span aria-current="page">{title}</span>
    </nav>
    <h1>{title}</h1>{intro && <p className="lead">{intro}</p>}{children && <div className="chip-row">{children}</div>}
  </div></div>;
}
export function SectionHeading({ title, intro, href, link }: { title: string; intro?: string; href?: string; link?: string }) {
  return <div className="section-head"><div><h2>{title}</h2>{intro && <p className="lead">{intro}</p>}</div>{href && <Link className="text-link" href={href}>{link ?? 'View all'}</Link>}</div>;
}
export function Metric({ value, label, detail }: { value: string | number; label: string; detail?: string }) {
  return <div className="metric"><strong>{value}</strong><div>{label}</div>{detail && <p>{detail}</p>}</div>;
}
export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return <div className="panel empty"><SearchX size={30} aria-hidden="true" /><h3>{title}</h3>{children}</div>;
}
export function ResourceCard({ resource, image = true }: { resource: Resource; image?: boolean }) {
  const ward = wardName(resource.ward);
  return <article className="card">
    {image && resource.image && <LocalImage media={resource.image} />}
    <div className="card-body">
      <div className="rsrc-meta"><span>{resource.category}</span>{ward && <span><MapPin size={14} aria-hidden="true" />{ward}</span>}</div>
      <h3><Link href={resourceUrl(resource)}>{resource.title}</Link></h3>
      <p className="small muted">{resource.summary}</p>
      <div className="chip-row"><TrustBadge trust={resource.trust} />{resource.status && <span className="status" data-tone={resource.status === 'In progress' ? 'warm' : undefined}>{resource.status}</span>}</div>
      {resource.deadline ? <p className="rsrc-meta"><span><CalendarDays size={15} /> Deadline <time dateTime={resource.deadline}>{formatDate(resource.deadline)}</time></span></p> : resource.date && <SourceLabel source={resource.source} date={resource.date} />}
      {resource.kind === 'opportunities' && resource.deadline && <DeadlineTag date={resource.deadline} />}
      {resource.price !== undefined && resource.kind === 'marketplace' && <strong>{money(resource.price)}</strong>}
    </div>
  </article>;
}
export function ResourceGrid({ items, image = true }: { items: Resource[]; image?: boolean }) {
  return <div className="grid">{items.map(item => <ResourceCard key={resourceUrl(item)} resource={item} image={image} />)}</div>;
}

export function MapPanel({ query, title = 'Location' }: { query: string; title?: string }) {
  return <div className="panel map-panel"><MapPin size={28} aria-hidden="true" /><h3>{title}</h3><p className="muted small">{query}</p>
    <a className="text-link" href={'https://www.openstreetmap.org/search?query=' + encodeURIComponent(query + ', Kenya')}>Find on OpenStreetMap</a></div>;
}
export function BarChart({ name, rows }: { name: string; rows: [string, number][] }) {
  const max = Math.max(...rows.map(([, n]) => n), 1);
  return <section className="panel flow"><h3>{name}</h3><ul aria-label={name} className="list-none m-0 p-0">
    {rows.map(([label, value]) => <li className="ledger" key={label}><div className="ledger-label"><span>{label}</span><strong>{value}</strong></div><span className="bar" aria-hidden="true"><span style={{ width: (value / max * 100) + '%' }} /></span></li>)}
  </ul></section>;
}
