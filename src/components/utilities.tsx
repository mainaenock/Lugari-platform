'use client';

import { Suspense, useState } from 'react';
import Link from '@/components/link';
import { useSearchParams } from 'next/navigation';
import { tenant, wardName } from '@/lib/tenant';
import { caseStatuses } from '@/lib/types';
import { money } from '@/lib/format';
import { useSimulation } from '@/services/local';
import { BarChart, Metric } from './content';
import { IntakeForm } from './engagement';

const ussd = [
  ['Latest news', '/news/', 'Read local updates and tap Back to return to the menu.'],
  ['Jobs', '/jobs/', 'Browse jobs and see the application deadline.'],
  ['Projects', '/projects/', 'Check the category, ward and source for each project.'],
  ['Report an issue', '/report/', 'Select an issue type and choose a ward to start a report.'],
  ['Events', '/events/', 'Check local event dates and locations.'],
  ['Subscribe', '/account/subscriptions/', 'Choose which topics and channels you want to follow.'],
  ['My ward', '/wards/', 'Browse all six wards and choose yours.'],
] as const;
export function UssdSimulator() {
  const [selection, setSelection] = useState(0);
  const [message, setMessage] = useState('');
  const screen = ussd[selection - 1];
  function keypad(number: number) {
    if (number === 0 || number === 10) { setSelection(0); setMessage(''); return; }
    if (ussd[number - 1]) { setSelection(number); setMessage(''); return; }
    setMessage('Choose a number from 1 to 7, or press 0 to go back.');
  }
  return <div className="content-grid">
    <div className="phone" aria-label="Feature phone simulator">
      <div className="phone-screen flow-tight" aria-live="polite">
        <strong>{screen ? screen[0] : 'KARIBU LUGARI'}</strong>
        {screen ? <><p>{screen[2]}</p><Link className="underline font-bold" href={screen[1]}>Open web page</Link><p>0. Back</p></> :
          <ol className="list-decimal pl-6">{ussd.map(([label], i) => <li key={label}><button onClick={() => keypad(i + 1)} className="underline underline-offset-2">{label}</button></li>)}</ol>}
        {message && <p>{message}</p>}
      </div>
      <div className="phone-keypad">{['1','2','3','4','5','6','7','8','9','*','0','#'].map(key => <button className="plain" aria-label={key === '0' ? '0, Back' : key === '*' ? 'Star, Back' : key === '#' ? 'Hash' : key} key={key} onClick={() => keypad(key === '*' ? 10 : key === '#' ? 11 : Number(key))}>{key}</button>)}</div>
    </div>
    <div className="panel flow"><h2>Try the menu</h2><p>Choose a number to browse services, or press 0 to return to the start.</p><p className="notice">USSD access requires telecom integration. A live dial code is unavailable.</p></div>
  </div>;
}
export function IssueMetrics() {
  const cases = useSimulation().cases;
  const unique = [...new Set(cases.map(item => item.category))];
  const resolved = cases.filter(item => item.status === 'Resolved').length;
  return <div className="flow">
    <p className="notice">Demo analytics based on the reports in this browser. Counts show categories and status only.</p>
    <div className="metric-grid"><Metric value={cases.length} label="Reports recorded" /><Metric value={resolved} label="Resolved" /><Metric value={cases.length ? Math.round(resolved * 100 / cases.length) + '%' : '0%'} label="Resolution rate" /><Metric value={unique.length} label="Issue categories" /></div>
    <div className="grid two"><BarChart name="Reports by ward" rows={tenant.wards.map(ward => [ward.name, cases.filter(item => item.ward === ward.slug).length])} />
      <BarChart name="Reports by status" rows={caseStatuses.map(status => [status, cases.filter(item => item.status === status).length])} /></div>
  </div>;
}

export function estimateAudience(ward: string, interest: string) {
  const base = ward && ward !== 'all' ? 180 + Math.max(0, tenant.wards.findIndex(choice => choice.slug === ward)) * 46 : 1800;
  const audience = interest === 'All topics' ? base : Math.round(base * 0.58);
  return { sms: audience, whatsapp: Math.round(audience * 0.72) };
}

export function AdEstimate() {
  const [ward, setWard] = useState('all');
  const [topic, setTopic] = useState('All topics');
  const [channel, setChannel] = useState('SMS');
  const count = estimateAudience(ward, topic);
  return <div className="content-grid">
    <div className="panel flow"><h2>Estimate a campaign</h2>
      <label className="field">Ward<select value={ward} onChange={event => setWard(event.target.value)}><option value="all">All wards</option>{tenant.wards.map(item => <option value={item.slug} key={item.slug}>{item.name}</option>)}</select></label>
      <label className="field">Topic<select value={topic} onChange={event => setTopic(event.target.value)}>{['All topics', 'Agriculture', 'Education', 'Jobs', 'Local businesses'].map(item => <option key={item}>{item}</option>)}</select></label>
      <label className="field">Channel<select value={channel} onChange={event => setChannel(event.target.value)}><option>SMS</option><option>WhatsApp</option></select></label>
      <div className="grid two" aria-live="polite">
        <Metric label="Estimated opted-in reach" value={channel === 'SMS' ? count.sms : count.whatsapp} detail={wardName(ward) || 'All wards'} />
        <Metric label="Illustrative cost" value={money(channel === 'SMS' ? count.sms : Math.ceil(count.whatsapp * 1.75))} detail="Demo pricing" />
      </div>
    </div>
    <IntakeForm bucket="advertising inquiry" label="Request advertising information" />
  </div>;
}

export function CorrectionIntake() {
  return <Suspense fallback={<p role="status">Loading correction form…</p>}><CorrectionForm /></Suspense>;
}
function CorrectionForm() {
  const subject = (useSearchParams().get('subject') || '').slice(0, 130);
  return <IntakeForm bucket="correction" subject={subject || undefined} label="Suggest a correction" includeWard={false} />;
}
