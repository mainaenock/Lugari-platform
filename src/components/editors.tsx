'use client';

import { useState, type FormEvent } from 'react';
import { catalog } from '@/services/catalog';
import { newId, saveItem, useSimulation } from '@/services/local';
import { tenant, wardName } from '@/lib/tenant';
import { formatDate } from '@/lib/format';
import type { WorkflowItem } from '@/lib/types';
import { BarChart, Empty, Metric } from './content';

type Setup = { singular: string; bucket: string; title: string; categories: string[]; states: string[]; fields?: [key: string, label: string, kind?: string][] };
const publishing = ['Draft', 'Pending review', 'Published', 'Archived'];
export const configs: Record<string, Setup> = {
  projects: { singular: 'project', bucket: 'project draft', title: 'Project register', categories: ['Education', 'Roads', 'Water', 'Electricity', 'Health', 'Other'], states: publishing,
    fields: [['project-status', 'Project status'], ['progress', 'Progress (%)', 'number'], ['budget', 'Approved budget (KSh)', 'number'], ['spent', 'Spent so far (KSh)', 'number'], ['milestone', 'Milestone and date'], ['source', 'Document or source URL', 'url'], ['photos', 'Photo selection', 'file']] },
  content: { singular: 'announcement', bucket: 'announcement', title: 'Content publishing', categories: ['Announcement', 'Article', 'Notice', 'Alert'],
    states: ['Draft', 'Pending review', 'Scheduled', 'Published', 'Rejected', 'Archived'],
    fields: [['source', 'Publication source URL', 'url'], ['schedule', 'Schedule date', 'date']] },
  appointments: { singular: 'appointment', bucket: 'appointment', title: 'Appointment requests', categories: ['appointment', 'Public office', 'Field visit'], states: ['Received', 'Approved', 'Rescheduled', 'Referred', 'Rejected'],
    fields: [['staff', 'Assigned staff'], ['schedule', 'Proposed date', 'date'], ['reason', 'Decision or referral note']] },
  'public-participation': { singular: 'consultation', bucket: 'consultation', title: 'Public consultations', categories: ['Consultation', 'Community proposal', 'Priority survey'], states: publishing,
    fields: [['date', 'Closing date', 'date'], ['documents', 'Supporting document', 'file'], ['summary', 'Summary of outcomes']] },
  team: { singular: 'team membership', bucket: 'team', title: 'Team and permissions', categories: ['Organization admin', 'Publisher', 'Case worker', 'Project manager', 'Communications officer', 'Analyst', 'Viewer'], states: ['Draft', 'Invited', 'Active', 'Suspended'] },
  media: { singular: 'media record', bucket: 'media', title: 'Media library', categories: ['Image', 'Document', 'Video', 'Thumbnail'], states: ['Draft', 'Ready for review', 'Approved', 'Archived'],
    fields: [['file', 'Select asset', 'file'], ['alt', 'Alt text'], ['source', 'Copyright or source'], ['privacy', 'Privacy classification']] },
};
let seed: Record<string, WorkflowItem[]> | undefined;
function samples(section: string) {
  seed ??= {
    projects: catalog.list('projects').slice(0, 5).map(item => ({ id: item.slug, title: item.title, body: item.summary, ward: item.ward ?? '', category: item.category, status: 'Published', date: item.date || '2026-11-20', details: { 'project-status': item.status || '', source: item.source.url || '' } })),
    content: [{ id: 'example-quarterly-notice', title: 'Example quarterly community notice', body: 'Invite residents to review the ward development archive and share priorities.', ward: 'mautuma', category: 'Announcement', status: 'Draft', date: '2026-11-20' }],
    team: [{ id: 'role-case', title: 'Example case coordinator', body: 'Can review and assign incoming cases.', ward: '', category: 'Case worker', status: 'Active', date: '2026-11-20' }],
  };
  return seed[section] ?? [];
}
export function RecordDesk({ section }: { section: string }) {
  const config = configs[section];
  const state = useSimulation();
  const [active, setActive] = useState('');
  const rows = state.items[config.bucket] ?? [];
  const records = [...rows, ...samples(section).filter(sample => !rows.some(row => row.id === sample.id))];
  const entry = records.find(record => record.id === active);
  const responses = state.items['consultation response'] ?? [];
  return <div className="flow">
    <section className="panel flow"><div className="split"><h2>{config.title}</h2><button className="quiet-button" onClick={() => setActive('')} disabled={!active}>Create {config.singular}</button></div>
      {records.length === 0 ? <Empty title={'No ' + config.singular + ' records saved in this browser'} /> :
        <div className="data-table"><table><caption>Demo workspace records</caption><thead><tr>{['Title', 'Ward', 'Type', 'Status', 'Updated'].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>
          {records.map(item => <tr key={item.id}><th scope="row"><button className="text-link" onClick={() => setActive(item.id)}>{item.title}</button></th><td>{wardName(item.ward) || 'All wards'}</td><td>{item.category}</td><td>{item.status}</td><td>{formatDate(item.date)}</td></tr>)}
        </tbody></table></div>}
    </section>
    <RecordEditor setup={config} item={entry} onSave={setActive} key={entry?.id || 'new'} />
    {section === 'public-participation' && <div className="flow"><Metric value={responses.length} label="Demo responses received" /><BarChart name="Response distribution" rows={tenant.wards.map(ward => [ward.name, responses.filter(item => item.ward === ward.slug).length])} />{responses.map(item => <div className="panel flow-tight" key={item.id}><h3>{item.title}</h3><p>{item.body}</p></div>)}</div>}
    {section === 'team' && <section className="panel flow"><h2>Permission matrix</h2><div className="data-table"><table><thead><tr><th>Role</th><th>Workspace permissions</th></tr></thead><tbody>
      {[['Organization admin', 'Manage team and approve institution changes'], ['Publisher', 'Draft and publish organization content'], ['Case worker', 'Review, assign and respond to cases'], ['Project manager', 'Manage milestones and project media'], ['Communications officer', 'Draft and schedule approved campaigns'], ['Analyst', 'Review aggregate dashboards'], ['Viewer', 'Read workspace records']].map(([role, value]) => <tr key={role}><th scope="row">{role}</th><td>{value}</td></tr>)}
    </tbody></table></div></section>}
  </div>;
}
function RecordEditor({ setup, item, onSave }: { setup: Setup; item?: WorkflowItem; onSave: (id: string) => void }) {
  const [feedback, setFeedback] = useState('');
  const [asset, setAsset] = useState('');
  const formState = item?.status || setup.states[0];
  const reviewing = setup.states.includes('Pending review');
  const statuses = reviewing && formState === 'Draft' ? setup.states.filter(status => status === 'Draft' || status === 'Pending review')
    : reviewing && formState === 'Pending review' ? setup.states.filter(status => ['Draft', 'Pending review', 'Published', 'Rejected', 'Scheduled'].includes(status)) : setup.states;
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const title = String(values.get('title') || '').trim();
    const body = String(values.get('body') || '').trim();
    if (!title || body.length < 10) { setFeedback('Enter a title and at least ten characters of detail.'); return; }
    const id = item?.id || newId();
    const details = Object.fromEntries((setup.fields ?? []).map(([key, , type]) => {
      const value = values.get(key);
      return [key, type === 'file' ? value instanceof File && value.size ? value.name : item?.details?.[key] || '' : String(value || '').trim()];
    }));
    saveItem(setup.bucket, { id, title, body, ward: String(values.get('ward') || ''), category: String(values.get('category')),
      status: String(values.get('status')), date: new Date().toISOString(), details });
    onSave(id);
    setFeedback('Record saved in demo mode.');
  }
  return <form className="panel flow" onSubmit={submit}>
    <div className="split"><h2>{item ? 'Edit ' : 'Create '}{setup.singular}</h2><span className="status">{formState}</span></div>
    <label className="field">Title<input name="title" defaultValue={item?.title} required maxLength={130} /></label>
    <div className="grid">
      <label className="field">Ward<select name="ward" defaultValue={item?.ward || ''}><option value="">All wards</option>{tenant.wards.map(ward => <option key={ward.slug} value={ward.slug}>{ward.name}</option>)}</select></label>
      <label className="field">Type<select name="category" defaultValue={item?.category}>{setup.categories.map(category => <option key={category}>{category}</option>)}</select></label>
      <label className="field">Status<select name="status" defaultValue={formState}>{statuses.map(status => <option key={status}>{status}</option>)}</select></label>
    </div>
    <label className="field">Details<textarea name="body" defaultValue={item?.body} required minLength={10} maxLength={3000} /></label>
    {setup.fields && <div className="grid two">{setup.fields.map(([key, label, type]) => type === 'file' ?
      <label key={key} className="field">{label}<input name={key} type="file" onChange={event => setAsset(event.target.files?.[0]?.name || '')} /><small className="muted">{asset || item?.details?.[key] || 'File selection is simulated. Only its name is saved.'}</small></label> :
      <label key={key} className="field">{label}{key === 'project-status' ? <select name={key} defaultValue={item?.details?.[key] || 'Planned'}>{['Proposed', 'Planned', 'Procurement', 'In progress', 'Completed', 'Delayed', 'Suspended', 'Ready for handover', 'Reported activity'].map(status => <option key={status}>{status}</option>)}</select> : <input name={key} type={type || 'text'} defaultValue={item?.details?.[key]} min={type === 'number' ? 0 : undefined} max={key === 'progress' ? 100 : undefined} maxLength={500} />}</label>)}</div>}
    <button className="btn">Save {setup.singular}</button>
    {feedback ? <p className="small" role="status">{feedback}</p> : item && <p className="muted small">Saved status: {item.status}</p>}
  </form>;
}
export function LocalAnnouncements({ ward }: { ward?: string }) {
  const items = (useSimulation().items.announcement ?? []).filter(item => item.status === 'Published' && (!ward || !item.ward || item.ward === ward));
  if (!items.length) return null;
  return <section className="flow"><h2>Published in this demo</h2><div className="grid">{items.map(item => <article className="panel flow-tight" key={item.id}><span className="status">Demo data</span><h3>{item.title}</h3><p className="small muted">{wardName(item.ward) || 'All wards'} · {formatDate(item.date)}</p><p>{item.body}</p></article>)}</div></section>;
}
