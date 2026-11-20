'use client';

import { useState, type FormEvent } from 'react';
import Link from '@/components/link';
import { useRouter } from 'next/navigation';
import { Bell, BriefcaseBusiness, Building2, ClipboardList, MapPin, ShieldCheck, UserRound } from 'lucide-react';
import { catalog, resourceUrl } from '@/services/catalog';
import { caseTrackerUrl, clearLocal, setPreference, toggleList, updateLocal, useSimulation } from '@/services/local';
import { formatDate } from '@/lib/format';
import { tenant, wardName } from '@/lib/tenant';
import type { ConsentRecord, Role } from '@/lib/types';
import { Empty, Metric, ResourceGrid, SectionHeading } from './content';
import { WardPicker } from './preferences';

const topics = ['Community information', 'My ward', 'Jobs', 'Bursaries', 'Education', 'Agriculture', 'Business offers', 'Events', 'Leadership updates', 'Emergency alerts'];
const channels = ['SMS', 'WhatsApp', 'Email', 'Web notifications'];
export const workspaces = { resident: '/account/', institution: '/portal/dashboard/', admin: '/admin/dashboard/' };
const demoRoles: { role: Role; title: string; description: string; icon: typeof UserRound }[] = [
  { role: 'resident', title: 'Resident demo', description: 'Choose a ward, keep track of reports and save useful listings.', icon: UserRound },
  { role: 'institution', title: 'Institution demo', description: 'Review civic cases, publish updates and preview campaigns.', icon: Building2 },
  { role: 'admin', title: 'Platform admin demo', description: 'Review moderation, verification, advertising and audit history.', icon: ShieldCheck },
];

export function SignIn({ registration = false, requiredRole }: { registration?: boolean; requiredRole?: Role }) {
  const router = useRouter();
  const [stage, setStage] = useState<'start' | 'verify'>('start');
  const [method, setMethod] = useState('phone');
  const [error, setError] = useState('');
  const [profile, setProfile] = useState({ name: '', ward: '', language: 'en' as 'en' | 'sw' });
  function enter(role: Role, link = workspaces[role]) {
    updateLocal(state => ({ ...state, role, name: role === 'resident' ? profile.name || 'Resident' : '',
      preferences: { ...state.preferences, ward: profile.ward || state.preferences.ward, language: registration ? profile.language : state.preferences.language },
    }));
    router.push(link);
  }
  function process(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const data = new FormData(event.currentTarget);
    if (stage === 'verify') {
      if (data.get('code') !== '123456') { setError('Enter the sample code 123456.'); return; }
      enter('resident', registration ? '/account/subscriptions/' : '/account/');
      return;
    }
    const phone = String(data.get('credential') || '').replace(/[\s()-]/g, '');
    if (method === 'phone' && !/^(?:\+254|254|0)[17]\d{8}$/.test(phone)) {
      setError('Enter a Kenyan number such as 0712 000 000. Use sample details.'); return;
    }
    setProfile({ name: String(data.get('name') || '').trim(), ward: String(data.get('ward') || ''), language: data.get('language') === 'sw' ? 'sw' : 'en' });
    setStage('verify');
  }
  return <div className="flow">
    <p className="notice">These workspaces use demonstration roles and data stored in this browser. Use sample details.</p>
    <div className="grid">{demoRoles.filter(option => !requiredRole || option.role === requiredRole).map(({ role, title, description, icon: Icon }) => <article key={role} className="panel flow-tight">
      <span className="action-icon"><Icon size={23} /></span><h2 className="text-xl">{title}</h2><p className="small muted">{description}</p><button className="btn" onClick={() => enter(role)}>Open {title.toLowerCase()}</button>
    </article>)}</div>
    {!requiredRole && <form className="panel flow" onSubmit={process}>
      <h2>{registration ? 'Resident profile' : 'Resident sign-in'}</h2>
      {stage === 'start' ? <>
        <div className="button-row"><button type="button" className="chip" aria-pressed={method === 'phone'} onClick={() => setMethod('phone')}>Phone</button><button type="button" className="chip" aria-pressed={method === 'email'} onClick={() => setMethod('email')}>Email</button></div>
        <label className="field">{method === 'phone' ? 'Sample phone number' : 'Sample email'}<input key={method} name="credential" type={method === 'phone' ? 'tel' : 'email'} required placeholder={method === 'phone' ? '0712 000 000' : 'resident@example.com'} /></label>
        {registration && <>
          <label className="field">Display name (optional)<input name="name" maxLength={60} /></label>
          <label className="field">Ward<select name="ward" required><option value="">Select a ward</option>{tenant.wards.map(ward => <option key={ward.slug} value={ward.slug}>{ward.name}</option>)}</select></label>
          <label className="field">Preferred language<select name="language"><option value="en">English</option><option value="sw">Kiswahili</option></select></label>
        </>}
      </> : <label className="field">Demo verification code<input name="code" inputMode="numeric" pattern="[0-9]{6}" required autoComplete="one-time-code" maxLength={6} /><small className="muted">Use 123456. No message is sent.</small></label>}
      {error && <p className="error" role="alert">{error}</p>}
      <div className="button-row"><button className="btn">{stage === 'start' ? 'Get sample code' : 'Verify demo code'}</button>
        {stage === 'verify' && <button type="button" className="quiet-button" onClick={() => { setStage('start'); setError(''); }}>Back</button>}
        {!registration && stage === 'start' && <Link className="text-link" href="/register/">Create a profile</Link>}
      </div>
    </form>}
  </div>;
}

export function SubscriptionSettings() {
  const state = useSimulation();
  const [saved, setSaved] = useState('');
  const config = state.subscriptions;
  function toggle(key: 'channels' | 'topics', value: string) {
    updateLocal(current => {
      const list = current.subscriptions[key];
      return { ...current, subscriptions: { ...current.subscriptions, [key]: list.includes(value) ? list.filter(item => item !== value) : [...list, value] } };
    });
    setSaved('Preferences saved on this device.');
  }
  return <div className="stack flow">
    <div className="panel flow"><h2>Which ward do you follow?</h2><WardPicker action="save" button="Save ward" /></div>
    <div className="grid two">
      <fieldset className="panel"><legend className="font-bold">Topics</legend>{topics.map(topic => <label className="check" key={topic}><input type="checkbox" checked={config.topics.includes(topic)} onChange={() => toggle('topics', topic)} />{topic}</label>)}</fieldset>
      <fieldset className="panel"><legend className="font-bold">Channels</legend>{channels.map(channel => <label className="check" key={channel}><input type="checkbox" checked={config.channels.includes(channel)} onChange={() => toggle('channels', channel)} />{channel}</label>)}
        <hr className="rule"/><label className="check"><input type="checkbox" checked={config.marketing} onChange={event => {
          const marketing = event.target.checked;
          updateLocal(current => ({ ...current, subscriptions: { ...current.subscriptions, marketing } }));
          setSaved('Marketing preference saved.');
        }} />Allow sponsored offers</label>
        <p className="small muted">SMS, WhatsApp and email delivery are simulated.</p>
      </fieldset>
    </div>
    <div className="button-row"><button className="quiet-button" onClick={() => {
      updateLocal(current => ({ ...current, subscriptions: { ...current.subscriptions, marketing: false } })); setSaved('Unsubscribed from marketing.');
    }}>Unsubscribe from marketing</button><button className="quiet-button" onClick={() => {
      updateLocal(current => ({ ...current, subscriptions: { channels: current.subscriptions.topics.includes('Emergency alerts') ? current.subscriptions.channels : [], topics: current.subscriptions.topics.filter(topic => topic === 'Emergency alerts'), marketing: false } }));
      setSaved('Non-essential messages disabled.');
    }}>Disable all non-essential messages</button></div>
    {saved && <p role="status" className="success">{saved}</p>}
  </div>;
}

export function PrivacyCenter() {
  const { preferences } = useSimulation();
  const [confirm, setConfirm] = useState(false);
  const [status, setStatus] = useState('');
  const consent = preferences.consent || { analytics: false, personalization: false, marketing: false };
  const choices: [keyof ConsentRecord, string][] = [['analytics', 'Aggregate analytics'], ['personalization', 'Personalized recommendations'], ['marketing', 'Marketing cookies']];
  return <div className="flow">
    <div className="panel flow"><h2>Your information</h2><p>This frontend keeps preferences, saved items and demonstration activity in your browser. Any future live service will need its own account and consent controls.</p><Link className="text-link" href="/account/subscriptions/">Communication preferences</Link></div>
    <div className="panel flow"><h2>Privacy settings</h2><label className="check"><input type="checkbox" checked disabled readOnly />Essential site storage</label>
      {choices.map(([key, label]) => <label className="check" key={key}><input type="checkbox" checked={consent[key]} onChange={event => {
        setPreference('consent', { ...consent, [key]: event.target.checked }); setStatus('Privacy settings saved.');
      }} />{label}</label>)}
      <button className="quiet-button" onClick={() => { setPreference('consent', { analytics: false, personalization: false, marketing: false }); setStatus('Essential storage only.'); }}>Use essential only</button>
    </div>
    <div className="panel flow"><h2>Local data</h2>
      <button className="quiet-button" onClick={() => {
        const blob = new Blob([localStorage.getItem('lugari-platform:v1') || '{}'], { type: 'application/json' });
        const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'lugari-local-demo-data.json'; link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000); setStatus('Local data export prepared.');
      }}>Export local data</button>
      {confirm ? <div className="notice flow-tight"><p>Remove the saved settings, reports and demo activity in this browser?</p>
        <div className="button-row"><button className="btn" onClick={() => { clearLocal(); setConfirm(false); setStatus('Local data cleared.'); }}>Clear local data</button><button className="quiet-button" onClick={() => setConfirm(false)}>Cancel</button></div>
      </div> : <button className="quiet-button" onClick={() => setConfirm(true)}>Clear local data</button>}
    </div>
    {status && <p className="success" role="status">{status}</p>}
  </div>;
}
export function ResidentView({ section }: { section: string }) {
  const state = useSimulation();
  const ward = wardName(state.preferences.ward);
  const resources = catalog.list(undefined, state.preferences.ward || undefined);
  const saved = catalog.list().filter(item => state.saved.includes(resourceUrl(item)));
  const reminders = catalog.list().filter(item => state.reminders.includes(resourceUrl(item)));
  if (section === 'subscriptions') return <SubscriptionSettings />;
  if (section === 'privacy') return <PrivacyCenter />;
  if (section === 'settings') return <div className="panel flow">
    <h2>Site preferences</h2><WardPicker action="save" button="Save ward" />
    <label className="check"><input type="checkbox" checked={state.preferences.saver} onChange={event => setPreference('saver', event.target.checked)} />Data saver</label>
    <label className="check"><input type="checkbox" checked={state.preferences.theme === 'dark'} onChange={event => setPreference('theme', event.target.checked ? 'dark' : 'light')} />Dark theme</label>
    <label className="field">Language<select value={state.preferences.language} onChange={event => setPreference('language', event.target.value === 'sw' ? 'sw' : 'en')}><option value="en">English</option><option value="sw">Kiswahili</option></select></label>
  </div>;
  if (section === 'saved') return saved.length ? <ResourceGrid items={saved} /> : <Empty title="No saved items yet"><Link className="btn" href="/opportunities/">Find opportunities</Link></Empty>;
  if (section === 'reports') return <div className="flow"><Link className="btn" href="/report/">Report an issue</Link>
    {state.cases.filter(item => item.reference !== 'LUG-84721').map(item => <article className="panel split" key={item.reference}><div><h3><Link href={caseTrackerUrl(item.reference)}>{item.reference}</Link></h3><p className="small muted">{item.category} · {wardName(item.ward)}</p></div><span className="status">{item.status}</span></article>)}
    {state.cases.every(item => item.reference === 'LUG-84721') && <Empty title="No reports submitted in this browser" />}
  </div>;
  if (section === 'notifications') {
    const notices = [
      { id: 'welcome', label: 'Choose your ward to find nearby updates', href: '/account/my-ward/', date: '2026-11-20' },
      ...reminders.map(item => ({ id: item.slug, label: 'Reminder: ' + item.title, href: resourceUrl(item), date: item.date || item.deadline || '2026-11-20' })),
    ];
    return <div className="flow">{notices.map(item => <article key={item.id} className="panel split"><div><h3><Link href={item.href}>{item.label}</Link></h3><p className="small muted">{formatDate(item.date)}</p></div><button className="quiet-button" onClick={() => toggleList('read', item.id)}>{state.read.includes(item.id) ? 'Mark unread' : 'Mark read'}</button></article>)}</div>;
  }
  if (section === 'my-ward') return <div className="flow"><div className="panel flow"><h2>{ward || 'Choose your ward'}</h2><WardPicker action="save" button="Save ward" />
    {ward && <Link className="text-link" href={'/wards/' + state.preferences.ward + '/'}>View {ward} Ward</Link>}</div>
    {(['projects', 'opportunities', 'events', 'businesses', 'alerts'] as const).map(kind => {
      const items = resources.filter(item => item.kind === kind).slice(0, 3);
      return <section className="flow-tight" key={kind}><SectionHeading title={{ projects: 'Development', opportunities: 'Nearby opportunities', events: 'Upcoming events', businesses: 'Local businesses', alerts: 'Ward alerts' }[kind]} href={'/' + kind + '/'} />
        {items.length ? <ResourceGrid items={items} /> : <p className="muted">There are no matching records in the directory.</p>}</section>;
    })}<div className="button-row"><Link className="text-link" href="/account/reports/">Your reports</Link><Link className="text-link" href="/account/saved/">Saved opportunities</Link></div>
  </div>;
  return <div className="flow">
    <h2>Welcome{state.name && state.name !== 'Resident' ? ', ' + state.name : ''}</h2>
    <div className="metric-grid"><Metric value={ward || 'Select'} label="My ward" /><Metric value={saved.length} label="Saved items" /><Metric value={state.cases.filter(item => item.reference !== 'LUG-84721').length} label="Reports" /><Metric value={state.subscriptions.channels.length} label="Alert channels" /></div>
    <div className="action-grid resident-actions">{[{ icon: MapPin, title: 'My ward', href: '/account/my-ward/' }, { icon: ClipboardList, title: 'My reports', href: '/account/reports/' }, { icon: BriefcaseBusiness, title: 'Saved items', href: '/account/saved/' }, { icon: Bell, title: 'Subscriptions', href: '/account/subscriptions/' }].map(({ icon: Icon, title, href }) => <Link key={href} className="quick-action" href={href}><span className="action-icon"><Icon size={19} /></span>{title}</Link>)}</div>
    <SectionHeading title={ward ? 'Opportunities near ' + ward : 'Explore opportunities'} href="/opportunities/" /><ResourceGrid items={resources.filter(item => item.kind === 'opportunities').slice(0, 3)} />
    {reminders.length > 0 && <><SectionHeading title="Your reminders" /><ResourceGrid items={reminders} /></>}
  </div>;
}
