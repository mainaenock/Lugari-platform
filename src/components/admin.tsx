'use client';

import { useState } from 'react';
import Link from '@/components/link';
import { decide, saveCampaign, useSimulation } from '@/services/local';
import { formatDate } from '@/lib/format';
import { tenant } from '@/lib/tenant';
import { Empty, Metric } from './content';

type Review = { id: string; title: string; category: string; description: string };
const sampleModeration: Review[] = [
  { id: 'business-mulembe', title: 'Mulembe Farm Supply', category: 'Business listing', description: 'Check the example category and contact fields before publication.' },
  { id: 'marketplace-chaff', title: 'Portable Chaff Cutter', category: 'Marketplace listing', description: 'Review sample pricing, seller safety information and listing terms.' },
  { id: 'correction-example', title: 'Example update date correction', category: 'Correction', description: 'A sample correction asks the reviewer to compare the archive date with the published notice.' },
  { id: 'media-school', title: 'School classroom photo', category: 'Uploaded media', description: 'Check licensing, consent and alt text before approving the example.' },
];
const sampleVerification: Review[] = [
  { id: 'verification-growers', title: 'Example Growers Hub', category: 'Community organization', description: 'Demo submission: organization registration extract and coordinator authorization.' },
  { id: 'verification-makers', title: 'Example Makers Circle', category: 'Youth organization', description: 'Demo submission: group registration letter and public contact information.' },
];
const sampleAds: Review[] = [
  { id: 'ads-farm-01', title: 'Farm supplies directory feature', category: 'Featured directory placement', description: 'Example placement for Mulembe Farm Supply. Verify the Sponsored disclosure before approval.' },
];

export function ReviewDesk({ section }: { section: 'moderation' | 'verification' | 'ads' }) {
  const state = useSimulation();
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState('');
  const moderation = section === 'moderation';
  const local = moderation ? ['correction', 'listing report', 'project observation', 'business claim', 'platform feedback', 'accessibility feedback'].flatMap(category => (state.items[category] ?? []).map(item => ({
    id: item.id, title: item.title, category, description: item.body,
  }))) : section === 'ads' ? (state.items['advertising inquiry'] ?? []).map(item => ({ id: item.id, title: item.title, category: 'Advertising inquiry', description: item.body })) : [];
  const list = [...local, ...(moderation ? sampleModeration : section === 'verification' ? sampleVerification : sampleAds)];
  const results = list.filter(item => filter === 'All' || (filter === 'Pending' ? !state.decisions[item.id] : !!state.decisions[item.id]));
  const entry = list.find(item => item.id === selected);
  const [notice, setNotice] = useState('');
  return <div className="flow">
    <section className="panel flow"><div className="split"><h2>Review queue</h2><span className="status">{results.length} records</span></div>
      <div className="button-row">{['All', 'Pending', 'Reviewed'].map(item => <button className="chip" key={item} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}</div>
      {results.length ? <div className="data-table"><table><caption>Demonstration records</caption><thead><tr><th>Record</th><th>Type</th><th>Decision</th></tr></thead>
        <tbody>{results.map(item => <tr key={item.id}><th scope="row"><button className="text-link" onClick={() => { setSelected(item.id); setNotice(''); }}>{item.title}</button></th><td>{item.category}</td><td>{state.decisions[item.id] || 'Pending'}</td></tr>)}</tbody></table></div> : <Empty title="No items in this queue" />}
    </section>
    {entry && <section className="panel flow"><h2>{entry.title}</h2><p className="eyebrow">{entry.category}</p><p className="break-words">{entry.description}</p>
      {section === 'verification' && <p className="notice">Reviewer: Platform admin demo. Document verification is simulated.</p>}
      {moderation && <p className="notice">AI-assisted review example: compare this record’s source, privacy and attribution before deciding.</p>}
      <div className="button-row">{['Approved', 'Rejected', 'Changes requested', 'Escalated'].map(action => <button className={action === 'Approved' ? 'btn' : 'quiet-button'} key={action} onClick={() => { decide(entry.id, action); setNotice(action + ' in demo mode. Decision recorded in the audit log.'); }}>{action === 'Approved' ? 'Approve' : action === 'Rejected' ? 'Reject' : action === 'Escalated' ? 'Escalate' : 'Request changes'}</button>)}</div>
      {notice && <p className="success" role="status">{notice}</p>}
    </section>}
    {section === 'ads' && <section className="panel flow"><h2>Campaign approvals</h2><p className="muted">Only opted-in audience estimates appear here. No message is delivered.</p>
      {state.campaigns.filter(campaign => campaign.status === 'Awaiting approval').map(campaign => <article className="panel flow-tight" key={campaign.id}><h3>{campaign.title}</h3><p>{campaign.message}</p><p className="small muted">{campaign.channels.join(', ')}</p><div className="button-row">
        <button className="btn" onClick={() => saveCampaign({ ...campaign, status: 'Approved', date: new Date().toISOString() })}>Approve campaign</button>
        <button className="quiet-button" onClick={() => saveCampaign({ ...campaign, status: 'Rejected', date: new Date().toISOString() })}>Reject campaign</button>
      </div></article>)}
      {state.campaigns.every(campaign => campaign.status !== 'Awaiting approval') && <p>No campaigns are waiting for approval.</p>}
    </section>}
  </div>;
}
export function AdminView({ section }: { section: string }) {
  const state = useSimulation();
  if (section === 'moderation' || section === 'verification' || section === 'ads') return <ReviewDesk section={section} key={section} />;
  if (section === 'tenants') return <section className="panel flow"><div className="split"><h2>Active tenancy</h2><button className="quiet-button" disabled>Create new tenant</button></div>
    <div className="data-table"><table><thead><tr><th>Tenant</th><th>Domain</th><th>Wards</th><th>Status</th></tr></thead><tbody><tr><th scope="row">{tenant.name}</th><td>{tenant.domain}</td><td>{tenant.wards.length}</td><td><span className="status">Active</span></td></tr></tbody></table></div>
    <p className="small muted">The demo is configured for one tenant.</p></section>;
  if (section === 'audit') return <section className="panel flow"><h2>Recent activity</h2><p className="small muted">This demo log records workspace actions in the current browser.</p>
    {!state.audit.length ? <Empty title="No logged activity yet"><Link className="text-link" href="/admin/moderation/">Open review queue</Link></Empty> :
      <div className="data-table"><table><thead><tr>{['When', 'Actor', 'Action', 'Resource', 'Previous state'].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{state.audit.map(item => <tr key={item.id}><td><time dateTime={item.date}>{formatDate(item.date)} · {new Intl.DateTimeFormat('en-KE', { hour: 'numeric', minute: '2-digit', timeZone: 'Africa/Nairobi' }).format(new Date(item.date))}</time></td><td>{item.actor}</td><td>{item.action}</td><th scope="row">{item.resource}</th><td>{item.before || '—'}</td></tr>)}</tbody></table></div>}
  </section>;
  return <div className="flow">
    <p className="notice">Demo analytics. Record counts reflect the sample queue and activity in this browser.</p>
    <div className="metric-grid"><Metric value="Ready" label="Demo platform health" /><Metric value={sampleModeration.filter(item => !state.decisions[item.id]).length} label="Sample moderation items" /><Metric value={sampleVerification.filter(item => !state.decisions[item.id]).length} label="Organizations to verify" /><Metric value={state.campaigns.filter(item => item.status === 'Awaiting approval').length} label="Campaigns awaiting approval" /></div>
    <div className="grid two">{[
      ['Moderation', 'Review business listings, submissions and corrections.', '/admin/moderation/'],
      ['Organization verification', 'Review demonstration records for organizations requesting verification.', '/admin/verification/'],
      ['Advertising', 'Inspect paid placements and approve demonstration campaigns.', '/admin/ads/'],
      ['Audit history', 'See recent changes and review decisions.', '/admin/audit/'],
    ].map(([title, text, href]) => <article className="panel flow-tight" key={title}><h3>{title}</h3><p className="muted">{text}</p><Link className="text-link" href={href}>Open {title.toLowerCase()}</Link></article>)}</div>
  </div>;
}
