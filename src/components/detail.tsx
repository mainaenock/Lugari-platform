import Link from '@/components/link';
import { CalendarDays, MapPin } from 'lucide-react';
import { formatDate, money } from '@/lib/format';
import { directories } from '@/lib/routes';
import { tenant, wardName } from '@/lib/tenant';
import type { Project, Resource } from '@/lib/types';
import { catalog, resourceUrl } from '@/services/catalog';
import { DetailActions, IntakeForm } from './engagement';
import { MapPanel, PageHeading, ResourceGrid, SectionHeading, SourceLabel, TrustBadge } from './content';
import { DeadlineTag, LocalImage } from './preferences';

export function ResourceDetail({ item }: { item: Resource }) {
  const path = resourceUrl(item);
  const ward = wardName(item.ward);
  const place = item.location || ward;
  const project = item.kind === 'projects' ? item as Project : undefined;
  const cover = project ? item.image : undefined;
  const photos = [cover ? undefined : item.image, ...(item.gallery || [])].filter(media => media !== undefined);
  const related = catalog.list(item.kind, item.ward).filter(record => record.slug !== item.slug).slice(0, 3);
  return <>
    <PageHeading title={item.title} intro={item.summary} parent={{ label: directories[item.kind].title, href: '/' + item.kind + '/' }}>
      <TrustBadge trust={item.trust} />
      {item.status && <span className="status" data-tone="warm">{item.status}</span>}
      {place && <span className="rsrc-meta"><MapPin size={15} />{place}</span>}
    </PageHeading>
    <div className="wrap section flow">
      <div className="content-grid">
        <div className="flow">
          {cover && <figure className="detail-cover flow-tight">
            <LocalImage media={cover} mode="gallery" />
            <figcaption className="small muted">{cover.alt}. {cover.caption}</figcaption>
          </figure>}
          {project && <section className="panel flow"><h2>Project progress</h2>
            <p>{project.progress !== undefined ? <><strong>{project.progress}%</strong> recorded progress</> : 'Percentage progress is unavailable.'}</p>
            {project.progress !== undefined && <progress className="w-full" value={project.progress} max={100} aria-label="Project progress" />}
            <p className="muted">{project.trust === 'Demo data' ? 'Sample figures for the frontend demonstration.' : 'The status shown reflects the dated source. Recent progress may differ.'}</p>
            <dl className="grid two small">
              <div><dt className="muted">Reference</dt><dd>{project.slug}</dd></div>
              <div><dt className="muted">Implementing institution</dt><dd>{project.organization || 'Unavailable'}</dd></div>
              <div><dt className="muted">Funding source</dt><dd>{project.funding || 'Unavailable'}</dd></div>
              <div><dt className="muted">{project.estimatedCost !== undefined ? 'Published allocation' : 'Approved budget'}</dt><dd>{project.price === undefined ? 'Unavailable' : money(project.price)}</dd></div>
              {project.estimatedCost !== undefined && <div><dt className="muted">Published estimated cost</dt><dd>{money(project.estimatedCost)}</dd></div>}
              <div><dt className="muted">Recorded spending</dt><dd>{project.spent === undefined ? 'Unavailable' : money(project.spent)}</dd></div>
              <div><dt className="muted">Financial year</dt><dd>{project.financialYear ?? 'Unavailable'}</dd></div>
            </dl>
          </section>}
          {(project || item.details?.length) && <section className="panel flow"><h2>{project ? 'Timeline and updates' : 'Details'}</h2>
            <ol className="timeline">
              {(item.details || [{ heading: formatDate(item.date), text: item.summary }]).map(detail => <li key={detail.heading}><h3>{detail.heading}</h3><p>{detail.text}</p></li>)}
            </ol>
          </section>}
          {photos.length > 0 && <section className="panel flow"><h2>{project ? 'Project photos' : 'Photos'}</h2>
            <div className={'grid ' + (photos.length === 1 ? 'single' : 'two')}>{photos.map(media => <figure className="flow-tight" key={media.src}>
              <LocalImage mode="gallery" media={media} /><figcaption className="small muted">{media.alt}. {media.caption}</figcaption></figure>)}</div>
          </section>}
          {item.kind === 'opportunities' && <>
            {item.deadline && <div className="panel flow-tight"><h2>Deadline</h2><p><CalendarDays size={18} /> <time dateTime={item.deadline}>{formatDate(item.deadline)}</time></p><DeadlineTag date={item.deadline} /></div>}
            <div className="panel flow-tight"><h2>How to apply</h2>
              {item.href ? <a className="btn" href={item.href}>Open the official resource</a> : <p>This example listing shows how an opportunity will appear. Applications are unavailable in demo mode.</p>}
              <Link className="text-link" href="/account/subscriptions/">Set alerts for similar opportunities</Link>
            </div>
          </>}
          {item.kind === 'marketplace' && <div className="notice">Check the item, the seller’s identity and any documents in person before paying. This is a sample listing.</div>}
          {item.kind === 'businesses' && <section className="panel flow-tight"><h2>Contact and services</h2><p>{item.summary}</p><p className="muted">Phone and WhatsApp details are unavailable for illustrative business listings.</p>{place && <a className="text-link" href={'https://www.openstreetmap.org/search?query=' + encodeURIComponent(place + ', Kenya')}>Find the area on a map</a>}</section>}
          {item.kind === 'events' && <section className="panel flow-tight"><h2>Event information</h2><p><time dateTime={item.date}>{formatDate(item.date)}</time>{place && ' · ' + place}</p><p>{item.organization || 'Organizer unavailable'}</p><p>Use the reminder or RSVP controls to try the event workflow.</p></section>}
          {item.kind === 'schools' && <section className="panel flow-tight"><h2>School information</h2><p>{item.category}{place ? ' · ' + place : ''}</p><p className="muted">Published contact and enrolment data are unavailable in this profile.</p>{catalog.find('projects', item.slug) && <Link className="text-link" href={'/projects/' + item.slug + '/'}>View the school’s development record</Link>}</section>}
          {item.kind === 'public-participation' && <><p className="notice">Responses to this example consultation are saved on this device. They do not count as a vote.</p><IntakeForm bucket="consultation response" subject={item.title} label="Share a response" /></>}
        </div>
        <aside className="flow" aria-label="Sources and actions">
          <section className="panel flow"><h2>Source and attribution</h2><TrustBadge trust={item.trust} /><SourceLabel source={item.source} date={item.date} />
            {item.organization && <p>{item.organization}</p>}
            <DetailActions href={path} title={item.title} kind={item.kind} />
          </section>
          {place && <MapPanel query={place + ', ' + tenant.county} />}
          {project && <div className="panel flow-tight"><h3>Documents and corrections</h3>
            {item.source.url && <p><a className="text-link" href={item.source.url}>Read the source update</a></p>}
            <p className="small muted">No correction is listed for this record.</p>
            <Link className="text-link" href={'/corrections/?subject=' + encodeURIComponent(item.title)}>Report incorrect information</Link></div>}
          {item.kind === 'businesses' && <IntakeForm bucket="business claim" subject={item.title} label="Claim this business" includeWard={false} />}
          {item.kind === 'marketplace' && <IntakeForm bucket="listing report" subject={item.title} label="Report listing" includeWard={false} />}
        </aside>
      </div>
      {project && <IntakeForm bucket="project observation" subject={item.title} label="Submit a project observation" includeWard={false} />}
      {related.length > 0 && <section><SectionHeading title={'Related ' + item.kind.replaceAll('-', ' ')} /><ResourceGrid items={related} /></section>}
    </div>
  </>;
}
