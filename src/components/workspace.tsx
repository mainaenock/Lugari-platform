'use client';

import { useState } from 'react';
import Link from '@/components/link';
import { ChevronDown, ShieldCheck, Sparkles } from 'lucide-react';
import { privateGroups } from '@/lib/navigation';
import { tenant } from '@/lib/tenant';
import type { Role } from '@/lib/types';
import { catalog } from '@/services/catalog';
import { updateLocal, useSimulation } from '@/services/local';
import { AdminView } from './admin';
import { BarChart, Metric, ResourceGrid } from './content';
import { CampaignDesk } from './campaigns';
import { CaseDesk } from './case-desk';
import { configs, RecordDesk } from './editors';
import { ResidentView, SignIn } from './resident';

const roles: Record<Area, Role> = { account: 'resident', portal: 'institution', admin: 'admin' };
export type Area = keyof typeof privateGroups;
const titles: Record<Area, string> = { account: 'Resident workspace', portal: 'Institution workspace', admin: 'Platform administration' };

export function Workspace({ area, section }: { area: Area; section: string }) {
  const { role } = useSimulation();
  const [show, setShow] = useState(false);
  if (role !== roles[area]) {
    if (area === 'account' && ['privacy', 'subscriptions'].includes(section)) return <ResidentView section={section} />;
    return <SignIn requiredRole={roles[area]} />;
  }
  const label = titles[area];
  return <div className="workspace">
    <aside>
      <div className="panel flow-tight">
        <p className="eyebrow"><ShieldCheck size={15} />Demo workspace</p>
        <button type="button" className="plain text-link workspace-menu-toggle" aria-expanded={show} onClick={() => setShow(!show)}>{label}<ChevronDown size={15} /></button>
        <nav className={show ? 'workspace-menu is-open' : 'workspace-menu'} aria-label={label}>
          {privateGroups[area].map(([title, slug]) => <Link href={'/' + area + '/' + (slug ? slug + '/' : '')} key={title} aria-current={section === slug ? 'page' : undefined}>{title}</Link>)}
        </nav>
        <Link className="text-link small" href="/sign-in/" onClick={() => updateLocal(state => ({ ...state, role: undefined, name: undefined }))}>Switch demo role</Link>
      </div>
    </aside>
    <div className="flow">{area === 'account' ? <ResidentView section={section} /> :
      area === 'portal' ? <InstitutionView section={section} /> :
      section === 'media' ? <RecordDesk section="media" /> : <AdminView section={section} />}</div>
  </div>;
}
function InstitutionView({ section }: { section: string }) {
  const state = useSimulation();
  const events = catalog.list('events');
  const unresolved = state.cases.filter(report => !['Closed', 'Resolved'].includes(report.status));
  const total = state.cases.length;
  const topics = [...new Set(state.cases.map(item => item.category))].map(category => [category, state.cases.filter(item => item.category === category).length] as [string, number]).sort((a, b) => b[1] - a[1]);
  if (section === 'cases') return <CaseDesk />;
  if (section === 'campaigns') return <CampaignDesk />;
  if (Object.hasOwn(configs, section)) return <RecordDesk section={section} key={section} />;
  if (section === 'calendar') return <div className="flow"><h2>Public calendar</h2><ResourceGrid items={events} /><Link className="text-link" href="/portal/appointments/">Open appointments</Link><Link className="text-link" href="/events/">Open the public calendar view</Link></div>;
  if (section === 'analytics') return <div className="flow"><p className="notice">Demo analytics. Case counts reflect this browser. Traffic and engagement require a connected analytics service.</p>
    <div className="metric-grid"><Metric value={total} label="Recorded cases" /><Metric value={unresolved.length} label="Unresolved" /><Metric value={state.campaigns.length} label="Campaigns" /><Metric value={(state.items.announcement || []).length} label="Content records" /></div>
    <div className="grid two"><BarChart name="Issue categories" rows={topics} /><BarChart name="Reports by ward" rows={tenant.wards.map(ward => [ward.name, state.cases.filter(item => item.ward === ward.slug).length])} /></div>
  </div>;
  if (section === 'ai-brief') return <div className="flow">
    <section className="panel flow"><p className="eyebrow"><Sparkles size={16}/> AI-generated summary · Simulation</p><h2>Weekly {tenant.shortName} brief</h2><p className="notice">Review before action. This summary uses example records and local demo activity.</p>
      <p>{total ? total + ' reports are recorded in this browser. ' + unresolved.length + ' are still open.' : 'There are no demo reports in this browser yet.'} {topics[0] && topics[0][0] + ' is the most common reported category.'}</p>
    </section>
    <div className="grid two"><BarChart name="Community concerns" rows={topics} /><BarChart name="Ward distribution" rows={tenant.wards.map(ward => [ward.name, unresolved.filter(item => item.ward === ward.slug).length])} /></div>
    <section className="panel flow"><h3>Review items</h3><ul className="list-disc pl-6">
      <li>Check open cases and review suggested classification before assignment.</li>
      <li>Review project records with historical source dates before publishing progress updates.</li>
      <li>Confirm public event details and deadline dates from their original sources.</li>
    </ul><Link className="text-link" href="/portal/cases/">Review case inbox</Link></section>
  </div>;
  return <div className="flow"><p className="notice">Demo analytics. Counts reflect the local demonstration.</p>
    <div className="metric-grid"><Metric value={total} label="Community reports" /><Metric value={unresolved.length} label="Unresolved cases" /><Metric value={(state.items['project draft'] || []).filter(item => item.status !== 'Published').length} label="Project drafts" /><Metric value={state.campaigns.length} label="Communication campaigns" /></div>
    <div className="grid two">
      <section className="panel flow-tight"><h2>Case work</h2><p>{unresolved.length} reports to review, verify or refer.</p><Link className="text-link" href="/portal/cases/">Open case inbox</Link></section>
      <section className="panel flow-tight"><h2>Executive brief</h2><p>Review common concerns and open cases in the weekly briefing.</p><Link className="text-link" href="/portal/ai-brief/">Open the AI brief</Link></section>
      <section className="panel flow-tight"><h2>Publishing</h2><p>{(state.items.announcement || []).filter(item => item.status === 'Published').length} published announcements in this browser.</p><Link className="text-link" href="/portal/content/">Manage announcements</Link></section>
      <section className="panel flow-tight"><h2>Calendar</h2><p>{events.length} example community events in the directory.</p><Link className="text-link" href="/portal/calendar/">See events and appointments</Link></section>
    </div><BarChart name="Issue categories" rows={topics} />
  </div>;
}
