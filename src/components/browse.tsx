'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from '@/components/link';
import { catalog, resourceSearchText } from '@/services/catalog';
import { directories } from '@/lib/routes';
import { tenant, wardName } from '@/lib/tenant';
import { matches } from '@/lib/format';
import type { Project, Resource, ResourceKind } from '@/lib/types';
import { useSimulation } from '@/services/local';
import { Empty, MapPanel, ResourceGrid } from './content';
import { SearchBar } from './layout';

const pageSize = 9;
export function Browse({ kind, fixedCategory }: { kind: ResourceKind; fixedCategory?: string }) {
  return <Suspense fallback={<ResourceGrid items={catalog.list(kind).filter(record => !fixedCategory || record.category === fixedCategory).slice(0, pageSize)} />}><Directory kind={kind} fixedCategory={fixedCategory} /></Suspense>;
}

function Directory({ kind, fixedCategory }: { kind: ResourceKind; fixedCategory?: string }) {
  const params = useSearchParams();
  return <DirectoryFilters key={kind + ':' + params.toString()} kind={kind} fixedCategory={fixedCategory} startingCategory={params.get('category') ?? ''} />;
}
function DirectoryFilters({ kind, fixedCategory, startingCategory }: { kind: ResourceKind; fixedCategory?: string; startingCategory: string }) {
  const all = catalog.list(kind).filter(record => !fixedCategory || record.category === fixedCategory);
  const [filters, setFilters] = useState<Record<string, string>>({ Category: startingCategory });
  const [limit, setLimit] = useState(pageSize);
  const [view, setView] = useState<'list' | 'map' | 'calendar'>('list');
  const { preferences } = useSimulation();
  const cats = Array.from(new Set(all.map(record => record.category))).sort();
  const options: { label: string; values: string[]; match: (record: Resource, value: string) => boolean }[] = [
    { label: 'Ward', values: tenant.wards.map(ward => ward.name), match: (record, value) => wardName(record.ward) === value },
    ...(!fixedCategory ? [{ label: 'Category', values: cats, match: (record: Resource, value: string) => record.category === value }] : []),
  ];
  const select = (label: string, get: (record: Resource) => string | undefined) => ({
    label, values: [...new Set(all.flatMap(record => get(record) || []))].sort(), match: (record: Resource, value: string) => get(record) === value,
  });
  if (kind === 'projects') options.push(select('Status', item => item.status), select('Year', item => item.date?.slice(0, 4)), select('Implementing institution', item => item.organization), select('Funding source', item => (item as Project).funding), {
    label: 'Budget', values: ['Published value', 'Unavailable'], match: (item, value) => (item.price !== undefined) === (value === 'Published value'),
  });
  if (kind === 'opportunities') options.push(select('Organization', item => item.organization), {
    label: 'Deadline', values: ['Date listed', 'Confirm with provider'], match: (item, value) => Boolean(item.deadline) === (value === 'Date listed'),
  });
  if (kind === 'businesses' || kind === 'schools') options.push(select('Source status', item => item.trust));
  const filtered = all.filter(record => matches(resourceSearchText(record), filters.Search ?? '') &&
    options.every(option => !filters[option.label] || option.match(record, filters[option.label])));
  const sort = filters.Sort ?? '';
  if (sort === 'Title') filtered.sort((a, b) => a.title.localeCompare(b.title));
  if (sort === 'Newest') filtered.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  if (sort === 'Closing date') filtered.sort((a, b) => (a.deadline || '9999').localeCompare(b.deadline || '9999'));
  function set(label: string, value: string) {
    setFilters(previous => ({ ...previous, [label]: value }));
    setLimit(pageSize);
  }
  function clear() { setFilters({}); setLimit(pageSize); }
  return <div className="flow">
    <details className="panel filter-panel" open><summary>Search and filters</summary>
      <div className="filters">
        <label className="field">Search<input type="search" placeholder={'Search ' + directories[kind].title.toLowerCase()} value={filters.Search || ''} onChange={event => set('Search', event.target.value)} /></label>
        {options.filter(option => option.values.length).map(option => <label className="field" key={option.label}>{option.label}
          <select value={filters[option.label] || ''} onChange={event => set(option.label, event.target.value)}>
            <option value="">All</option>{option.values.map(value => <option key={value}>{value}</option>)}
          </select>
        </label>)}
        <label className="field">Sort<select value={sort} onChange={event => set('Sort', event.target.value)}><option value="">Featured</option><option>Title</option><option>Newest</option>{kind === 'opportunities' && <option>Closing date</option>}</select></label>
      </div>
    </details>
    <div className="split"><p role="status"><strong>{filtered.length}</strong> {filtered.length === 1 ? 'result' : 'results'}</p><div className="button-row">
      {(kind === 'projects' || kind === 'events') && <><button type="button" className="chip" aria-pressed={view === 'list'} onClick={() => setView('list')}>List</button>
        {kind === 'projects' && !preferences.saver && <button type="button" className="chip" aria-pressed={view === 'map'} onClick={() => setView('map')}>Locations</button>}
        {kind === 'events' && <button type="button" className="chip" aria-pressed={view === 'calendar'} onClick={() => setView('calendar')}>Calendar</button>}
      </>}
      <button className="quiet-button" onClick={clear}>Clear filters</button>
    </div></div>
    {view === 'map' && !preferences.saver && filtered.length > 0 && <MapPanel query={(filters.Ward || tenant.shortName) + ', ' + tenant.county} title="Explore project locations" />}
    {filtered.length === 0 ? <Empty title="No matches for these filters"><button className="btn" onClick={clear}>Reset filters</button><Link className="text-link" href="/account/subscriptions/">Set alert preferences</Link></Empty>
      : view === 'calendar' ? <div className="grid two">{[...new Set(filtered.map(item => item.date?.slice(0, 7) ?? 'Unscheduled'))].sort().map(month =>
        <div className="panel flow" key={month}><h3>{month === 'Unscheduled' ? month : new Intl.DateTimeFormat('en-KE', { month: 'long', year: 'numeric', timeZone: 'Africa/Nairobi' }).format(new Date(month))}</h3><ResourceGrid items={filtered.filter(item => item.date?.startsWith(month))} /></div>)}</div>
      : <ResourceGrid items={filtered.slice(0, limit)} />}
    {view !== 'calendar' && filtered.length > limit && <button className="btn" onClick={() => setLimit(current => current + pageSize)}>Show more results</button>}
  </div>;
}

const services = [
  { title: 'Report an issue', href: '/report/', keys: 'roads water electricity problem feedback case' },
  { title: 'Track a report', href: '/report/status/', keys: 'reference case status issue' },
  { title: 'Bursaries and education', href: '/education/', keys: 'school scholarships bursary fees' },
  { title: 'Public appointments', href: '/appointments/', keys: 'meeting public office appointment' },
  { title: 'USSD access', href: '/access/ussd/', keys: 'sms basic phone feature mobile' },
  { title: 'Agriculture hub', href: '/agriculture/', keys: 'market prices cows dairy farming livestock' },
  ...tenant.wards.map(ward => ({ title: ward.name + ' Ward', href: '/wards/' + ward.slug + '/', keys: 'ward local development' })),
];

export function SearchResults() {
  return <Suspense fallback={<div className="panel" role="status">Loading search…</div>}><SearchContent /></Suspense>;
}
function SearchContent() {
  const query = (useSearchParams().get('q') || '').trim().slice(0, 100);
  const recent = useSimulation().recent;
  const results = catalog.search(query);
  const matchedServices = query ? services.filter(service => matches(service.title + ' ' + service.keys, query)) : [];
  const kinds = new Set(results.map(result => result.kind));
  const suggestions = recent.length ? recent : ['Bursary', 'Teacher jobs', 'Mautuma transformer', 'Dairy cow', 'Lumakanda school', 'Road project'];
  return <div className="flow">
    <SearchBar compact initial={query} key={query} />
    {!query ? <div className="panel flow-tight"><h3>{recent.length ? 'Recent searches' : 'Try a search'}</h3><div className="chip-row">{suggestions.map(suggestion => <Link key={suggestion} className="chip" href={'/search/?q=' + encodeURIComponent(suggestion)}>{suggestion}</Link>)}</div></div> : <>
      <p role="status"><strong>{results.length + matchedServices.length}</strong> results for “{query}”</p>
      {matchedServices.length > 0 && <div className="panel flow-tight"><h3>Services and wards</h3><div className="chip-row">{matchedServices.map(service => <Link className="chip" key={service.href} href={service.href}>{service.title}</Link>)}</div></div>}
      {[...kinds].map(kind => <section className="cards-section flow-tight" key={kind}><h2>{directories[kind].title}</h2><ResourceGrid items={results.filter(result => result.kind === kind)} /></section>)}
      {results.length + matchedServices.length === 0 && <Empty title="No results found"><p className="muted">Try a ward name or a shorter term, such as “water” or “bursary”.</p></Empty>}
    </>}
  </div>;
}
