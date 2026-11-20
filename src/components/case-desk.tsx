'use client';

import { useState, type FormEvent } from 'react';
import Link from '@/components/link';
import { caseStatuses, type CaseStatus, type CivicCase } from '@/lib/types';
import { tenant, wardName } from '@/lib/tenant';
import { formatDate } from '@/lib/format';
import { caseTrackerUrl, updateCase, useSimulation } from '@/services/local';
import { Empty } from './content';

const staffOptions = ['Field officer', 'Case coordinator', 'Institution reviewer'];
const priorities = ['Low', 'Normal', 'High'];
function suggest(report: CivicCase) {
  const evidence = report.description.toLowerCase();
  const category = /transformer|outage|power line/.test(evidence) ? 'Electricity' : /water|pipe|borehole/.test(evidence) ? 'Water' : /culvert|pothole|road/.test(evidence) ? 'Roads' : report.category;
  return { category, priority: /blocked|outage|exposed|failure/.test(evidence) ? 'High' : 'Normal', summary: 'Review the ' + category.toLowerCase() + ' report in ' + (wardName(report.ward) || 'the selected ward') + ' and check for matching reports.' };
}
export function CaseDesk() {
  const state = useSimulation();
  const [ward, setWard] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [staff, setStaff] = useState('');
  const [priority, setPriority] = useState('');
  const [query, setQuery] = useState('');
  const [view, setView] = useState('Table');
  const [reference, setReference] = useState('');
  const selected = state.cases.find(item => item.reference === reference);
  const filtered = state.cases.filter(item => (!ward || item.ward === ward) && (!status || item.status === status) &&
    (!category || item.category === category) && (!staff || item.staff === staff) && (!priority || item.priority === priority) &&
    item.reference.toLowerCase().includes(query.trim().toLowerCase()));
  function openCase(next: string) {
    setReference(next);
    requestAnimationFrame(() => document.getElementById('selected-case-title')?.focus());
  }
  return <div className="flow">
    <div className="panel flow-tight"><h2>Case inbox</h2><p className="small muted">Reports submitted in this browser appear here for demonstration.</p>
      <div className="filters">
        <label className="field">Reference<input type="search" value={query} onChange={event => setQuery(event.target.value)} /></label>
        <label className="field">Ward<select value={ward} onChange={event => setWard(event.target.value)}><option value="">All wards</option>{tenant.wards.map(item => <option value={item.slug} key={item.slug}>{item.name}</option>)}</select></label>
        <label className="field">Status<select value={status} onChange={event => setStatus(event.target.value)}><option value="">All statuses</option>{caseStatuses.map(item => <option key={item}>{item}</option>)}</select></label>
        <label className="field">Category<select value={category} onChange={event => setCategory(event.target.value)}><option value="">All categories</option>{[...new Set(state.cases.map(item => item.category))].map(item => <option key={item}>{item}</option>)}</select></label>
        <label className="field">Assigned staff<select value={staff} onChange={event => setStaff(event.target.value)}><option value="">Anyone</option>{staffOptions.map(item => <option key={item}>{item}</option>)}</select></label>
        <label className="field">Priority<select value={priority} onChange={event => setPriority(event.target.value)}><option value="">All priorities</option>{priorities.map(item => <option key={item}>{item}</option>)}</select></label>
      </div><div className="button-row">{['Table', 'Board'].map(item => <button className="chip" aria-pressed={view === item} key={item} onClick={() => setView(item)}>{item}</button>)}</div>
    </div>
    {!filtered.length ? <Empty title="No cases match these filters"><Link className="text-link" href="/report/">Try submitting a report</Link></Empty> : view === 'Board' ?
      <div className="grid">{([...new Set(filtered.map(item => item.status))]).map(group => <section className="panel flow-tight" key={group}><h3>{group}</h3>{filtered.filter(item => item.status === group).map(item => <button key={item.reference} className="text-link block" onClick={() => openCase(item.reference)}>{item.reference} · {item.category}</button>)}</section>)}</div> :
      <div className="panel data-table"><table><caption>{filtered.length} case{filtered.length === 1 ? '' : 's'} found</caption><thead><tr>{['Reference', 'Category', 'Ward', 'Status', 'Assigned staff', 'Received'].map(item => <th key={item}>{item}</th>)}</tr></thead>
        <tbody>{filtered.map(item => <tr key={item.reference}><th scope="row"><button className="text-link" onClick={() => openCase(item.reference)}>{item.reference}</button></th><td>{item.category}</td><td>{wardName(item.ward)}</td><td>{item.status}</td><td>{item.staff || 'Unassigned'}</td><td>{formatDate(item.createdAt)}</td></tr>)}</tbody></table></div>}
    {selected && <CaseEditor report={selected} key={selected.reference} />}
  </div>;
}
function CaseEditor({ report }: { report: CivicCase }) {
  const [priority, setPriority] = useState(report.priority || 'Normal');
  const [assist, setAssist] = useState('');
  const [notice, setNotice] = useState('');
  const [preview, setPreview] = useState('');
  const suggestion = suggest(report);
  function update(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    updateCase(report.reference, { priority, status: data.get('status') as CaseStatus, staff: String(data.get('staff') || ''), notes: String(data.get('notes') || '') }, preview.trim());
    setPreview('');
    setNotice('Case updated in demo mode. The tracking page shows the public response.');
  }
  return <section className="panel flow">
    <div className="split"><h2 id="selected-case-title" tabIndex={-1}>{report.reference}</h2><span className="status">{report.status}</span></div>
    <p className="muted">{wardName(report.ward)} · {report.location} · {report.attachmentCount} photo{report.attachmentCount === 1 ? '' : 's'} recorded</p>
    <p className="break-words">{report.description}</p>
    <section className="notice flow-tight"><h3>AI-assisted classification · Simulation</h3><p><strong>{suggestion.category}</strong> · Suggested priority: {suggestion.priority}</p><p>{suggestion.summary}</p><p className="small">Check the suggestion before updating the case.</p>
      <div className="button-row"><button className="quiet-button" onClick={() => { setPriority(suggestion.priority); setAssist('Suggested priority applied. Confirm by saving the case.'); }}>Accept priority</button><button className="quiet-button" onClick={() => { setAssist('The priority field is ready for your review.'); document.getElementById('edit-priority')?.focus(); }}>Edit</button><button className="quiet-button" onClick={() => setAssist('Suggestion ignored.')}>Ignore</button></div>
      {assist && <p role="status">{assist}</p>}
    </section>
    <form className="flow" onSubmit={update}>
      <div className="grid"><label className="field">Status<select defaultValue={report.status} name="status">{caseStatuses.map(item => <option key={item}>{item}</option>)}</select></label>
        <label className="field">Assign staff<select name="staff" defaultValue={report.staff || ''}><option value="">Unassigned</option>{staffOptions.map(item => <option key={item}>{item}</option>)}</select></label>
        <label className="field">Priority<select id="edit-priority" value={priority} onChange={event => setPriority(event.target.value)}>{priorities.map(item => <option key={item}>{item}</option>)}</select></label></div>
      <label className="field">Internal notes<textarea name="notes" defaultValue={report.notes} maxLength={1000} /></label>
      <label className="field">Public response<textarea value={preview} onChange={event => setPreview(event.target.value)} maxLength={700} placeholder="Leave out names and personal details." /></label>
      {preview.trim() && <p className="notice"><strong>Public preview</strong><br />{preview}</p>}
      <div className="button-row"><button className="btn">Save case update</button><Link className="text-link" href={caseTrackerUrl(report.reference)}>Open public tracker</Link></div>
      {notice && <p className="success" role="status">{notice}</p>}
    </form>
    <div className="flow-tight"><h3>Status timeline</h3><ol className="timeline">{report.updates.map((item, index) => <li key={item.date + index}><strong>{item.status}</strong> · {formatDate(item.date)}<p>{item.response}</p></li>)}</ol></div>
  </section>;
}
