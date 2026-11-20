'use client';

import { useState, type FormEvent } from 'react';
import { MessageSquare, Smartphone } from 'lucide-react';
import { newId, saveCampaign, useSimulation } from '@/services/local';
import { tenant, wardName } from '@/lib/tenant';
import { formatDate, money } from '@/lib/format';
import type { Campaign, CampaignStatus } from '@/lib/types';
import { Empty, Metric } from './content';
import { estimateAudience } from './utilities';

const topics = ['All topics', 'Agriculture', 'Community information', 'Education', 'Jobs', 'Events'];
const channels = ['SMS', 'WhatsApp'];
export function CampaignDesk() {
  const campaigns = useSimulation().campaigns;
  const [selected, setSelected] = useState('');
  const item = campaigns.find(campaign => campaign.id === selected);
  return <div className="flow">
    <CampaignEditor key={selected || 'new'} item={item} onSaved={setSelected} />
    <section className="panel flow"><div className="split"><h2>Campaigns</h2><button className="quiet-button" onClick={() => setSelected('')} disabled={!selected}>New campaign</button></div>
      {!campaigns.length ? <Empty title="No campaigns saved yet" /> : <div className="data-table"><table><thead><tr>{['Campaign', 'Ward', 'Channels', 'Status'].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{campaigns.map(campaign => <tr key={campaign.id}><th scope="row"><button className="text-link" onClick={() => setSelected(campaign.id)}>{campaign.title}</button></th><td>{wardName(campaign.ward) || 'All wards'}</td><td>{campaign.channels.join(', ')}</td><td>{campaign.status}</td></tr>)}</tbody></table></div>}
    </section>
  </div>;
}
function CampaignEditor({ item, onSaved }: { item?: Campaign; onSaved: (id: string) => void }) {
  const [title, setTitle] = useState(item?.title || '');
  const [ward, setWard] = useState(item?.ward || 'all');
  const [interest, setInterest] = useState(item?.interest || 'All topics');
  const [selected, setSelected] = useState<string[]>(item?.channels || []);
  const [message, setMessage] = useState(item?.message || '');
  const [notice, setNotice] = useState('');
  const count = estimateAudience(ward, interest);
  const smsCount = selected.includes('SMS') ? count.sms : 0;
  const whatsappCount = selected.includes('WhatsApp') ? count.whatsapp : 0;
  const status = item?.status ?? 'Draft';
  const editable = status === 'Draft' || status === 'Rejected';
  const [date, setDate] = useState('');
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const button = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const action = (button?.value || 'Draft') as CampaignStatus;
    if (!title.trim() || message.trim().length < 10 || selected.length === 0) {
      setNotice('Add a title, message of at least 10 characters and one or more channels.'); return;
    }
    const id = item?.id || newId();
    const scheduledFor = action === 'Scheduled' && date ? date + ':00+03:00' : undefined;
    const saved = saveCampaign({ id, title: title.trim(), ward, interest, channels: selected, message: message.trim(), status: action, date: new Date().toISOString(), scheduledFor });
    if (!saved) {
      setNotice(action === 'Scheduled' ? 'Choose a future date and time in East Africa Time.' : 'This action is unavailable in the current approval state.');
      return;
    }
    onSaved(id);
    setNotice('Campaign ' + action.toLowerCase() + ' in demo mode. No messages were sent.');
  }
  return <form className="panel flow" onSubmit={submit}>
    <div className="split"><h2>{item ? 'Edit campaign' : 'Create a campaign'}</h2><span className="status">{status}</span></div>
    <p className="notice">Demo analytics. Audience figures are estimates for opted-in readers and contain no contact details. Political advertising is disabled.</p>
    <label className="field">Campaign name<input readOnly={!editable} value={title} onChange={event => setTitle(event.target.value)} required maxLength={110} /></label>
    <div className="grid two"><label className="field">Ward<select disabled={!editable} value={ward} onChange={event => setWard(event.target.value)}><option value="all">All wards</option>{tenant.wards.map(ward => <option value={ward.slug} key={ward.slug}>{ward.name}</option>)}</select></label>
      <label className="field">Target audience topic<select disabled={!editable} value={interest} onChange={event => setInterest(event.target.value)}>{topics.map(topic => <option key={topic}>{topic}</option>)}</select></label></div>
    <fieldset><legend className="font-bold">Delivery channels</legend><div className="button-row">{channels.map(channel => <label className="check" key={channel}><input type="checkbox" disabled={!editable} checked={selected.includes(channel)} onChange={() => setSelected(current => current.includes(channel) ? current.filter(value => value !== channel) : [...current, channel])} />{channel}</label>)}</div></fieldset>
    <label className="field">Message<textarea readOnly={!editable} value={message} onChange={event => setMessage(event.target.value)} required maxLength={600} minLength={10} /></label>
    <div className="grid two"><section className="panel flow-tight"><h3><Smartphone size={19}/> SMS preview</h3><p className="small muted">LUGARI UPDATE · {message.length} characters</p><p className="break-words">{message || 'Type a message to preview the SMS.'}</p></section>
      <section className="panel flow-tight"><h3><MessageSquare size={19}/> WhatsApp preview</h3><p className="small muted">{title || 'Lugari community update'}</p><p className="break-words">{message || 'Type a message to preview the WhatsApp template.'}</p><p className="small muted">Template button · View on Lugari.ke</p></section></div>
    <div className="grid"><Metric label="SMS estimate" value={smsCount} /><Metric label="WhatsApp estimate" value={whatsappCount} /><Metric label="Illustrative cost" value={money(smsCount + Math.ceil(whatsappCount * 1.75))} /></div>
    {status === 'Approved' && <label className="field">Schedule time (East Africa Time)<input type="datetime-local" value={date} onChange={event => setDate(event.target.value)} /></label>}
    {item?.scheduledFor && <p>Scheduled for {formatDate(item.scheduledFor)} at {item.scheduledFor.slice(11, 16)} EAT.</p>}
    <div className="button-row">{editable && <><button className="quiet-button" value="Draft">Save draft</button><button className="btn" value="Awaiting approval">Submit for approval</button></>}
      {status === 'Approved' && <button className="btn" value="Scheduled">Schedule demo campaign</button>}
      {item && status !== 'Cancelled' && <button className="quiet-button" value="Cancelled">Cancel campaign</button>}</div>
    {notice && <p role="status" className="small">{notice}</p>}
    {item && !notice && <p role="status" className="small">Saved status: {item.status}</p>}
  </form>;
}
