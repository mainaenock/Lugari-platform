'use client';

import { Suspense, useRef, useState, type FormEvent } from 'react';
import Link from '@/components/link';
import { useSearchParams } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { CalendarPlus, Check, Clipboard, Save, Share2 } from 'lucide-react';
import { tenant, wardName } from '@/lib/tenant';
import { formatDate } from '@/lib/format';
import { caseTrackerUrl, newId, saveItem, submitCase, toggleList, useSimulation } from '@/services/local';
import { Empty } from './content';

const categories = ['Roads', 'Electricity', 'Water', 'Security', 'Health', 'Education', 'Environment', 'Public infrastructure', 'Other'];
const steps = ['Issue type', 'Location', 'Description', 'Photos', 'Contact and consent', 'Review'];
const reportFields = z.object({
  category: z.string().refine(value => categories.includes(value), 'Choose an issue type.'),
  ward: z.string().refine(value => tenant.wards.some(ward => ward.slug === value), 'Select a ward.'),
  location: z.string().trim().min(2, 'Enter a village, estate or landmark.').max(120),
  description: z.string().trim().min(15, 'Please describe the problem in at least 15 characters.').max(1500),
  consent: z.boolean().refine(Boolean, 'Acknowledge the demo and public status note.'),
  contact: z.string().max(120),
  anonymous: z.boolean(),
});
type ReportFields = z.infer<typeof reportFields>;

export function ReportForm() {
  const { preferences } = useSimulation();
  const form = useForm<ReportFields>({ defaultValues: { category: '', ward: '', location: '', description: '', consent: false, contact: '', anonymous: true } });
  const anonymous = useWatch({ control: form.control, name: 'anonymous' });
  const [step, setStep] = useState(0);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [attachmentError, setAttachmentError] = useState('');
  const [reference, setReference] = useState('');
  const locked = useRef(false);
  const title = useRef<HTMLHeadingElement>(null);
  const current = form.getValues();
  function advance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    form.clearErrors();
    const values = form.getValues();
    const fieldGroups: (keyof ReportFields)[][] = [['category'], ['ward', 'location'], ['description'], [], ['consent'], ['category', 'ward', 'location', 'description', 'consent']];
    const validation = reportFields.safeParse(values);
    const errors = validation.success ? [] : validation.error.issues.filter(issue => fieldGroups[step].includes(issue.path[0] as keyof ReportFields));
    if (errors.length) {
      errors.forEach((issue, index) => form.setError(issue.path[0] as keyof ReportFields, { message: issue.message }, { shouldFocus: index === 0 }));
      return;
    }
    if (attachmentError && step === 3) return;
    if (step < steps.length - 1) {
      setStep(previous => previous + 1);
      requestAnimationFrame(() => title.current?.focus());
      return;
    }
    if (!validation.success || locked.current) return;
    locked.current = true;
    const { category, ward, location, description } = validation.data;
    setReference(submitCase({ category, ward, location, description, attachmentCount: attachments.length }));
    requestAnimationFrame(() => title.current?.focus());
  }
  const error = (name: keyof ReportFields) => form.formState.errors[name]?.message && <span className="error" role="alert">{form.formState.errors[name]?.message}</span>;
  if (reference) return <div className="panel flow">
    <span className="action-icon"><Check aria-hidden="true" /></span><h2 ref={title} tabIndex={-1}>Your demo report was recorded</h2>
    <p>Keep this reference to check the status in this browser.</p><p><strong className="font-mono text-2xl">{reference}</strong></p>
    <div className="button-row"><Link className="btn" href={caseTrackerUrl(reference)}>Track this report</Link><CopyButton value={reference} label="Copy reference" /><button type="button" className="quiet-button" onClick={() => window.print()}>Print reference</button></div>
  </div>;
  return <div className="flow">
    <p className="notice"><strong>For urgent danger or suspected crime, contact emergency authorities directly.</strong> This demo records reports on this device and does not dispatch them.</p>
    <form onSubmit={advance} noValidate className="panel flow">
      <p className="eyebrow">Step {step + 1} of {steps.length}</p>
      <progress className="w-full" aria-label="Reporting progress" value={step + 1} max={steps.length} />
      <h2 ref={title} tabIndex={-1}>{steps[step]}</h2>
      {step === 0 && <label className="field">What is the issue?<select {...form.register('category')} aria-invalid={!!form.formState.errors.category}><option value="">Choose an issue type</option>{categories.map(category => <option key={category}>{category}</option>)}</select>{error('category')}</label>}
      {step === 1 && <>
        <label className="field">Ward<select {...form.register('ward')} aria-invalid={!!form.formState.errors.ward}><option value="">Select a ward</option>{tenant.wards.map(ward => <option value={ward.slug} key={ward.slug}>{ward.name}</option>)}</select>{error('ward')}</label>
        {preferences.ward && <button type="button" className="text-link" onClick={() => form.setValue('ward', preferences.ward, { shouldDirty: true })}>Use my ward: {wardName(preferences.ward)}</button>}
        <label className="field">Village, estate or landmark<input {...form.register('location')} maxLength={120} aria-invalid={!!form.formState.errors.location} />{error('location')}</label>
      </>}
      {step === 2 && <label className="field">Describe what happened<textarea {...form.register('description')} maxLength={1500} placeholder="What did you observe, and when?" aria-invalid={!!form.formState.errors.description} /><small className="muted">Keep names, phone numbers and other personal details out of the description.</small>{error('description')}</label>}
      {step === 3 && <div className="flow-tight"><label className="field">Add up to three photos (optional)<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={event => {
        const files = Array.from(event.target.files ?? []);
        if (files.length > 3 || files.some(file => file.size > 5_000_000 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type))) {
          setAttachmentError('Choose up to three JPEG, PNG or WebP photos of 5 MB or less.'); setAttachments([]); return;
        }
        setAttachmentError(''); setAttachments(files.map(file => file.name));
      }} /></label><p className="muted small">This demo records the number of photos only. Files stay on your device.</p>
      {attachmentError && <p className="error" role="alert">{attachmentError}</p>}
      {attachments.length > 0 && <p>{attachments.length} photo{attachments.length === 1 ? '' : 's'} selected. <button className="text-link" type="button" onClick={event => {
        setAttachments([]); setAttachmentError(''); const input = event.currentTarget.closest('form')?.querySelector<HTMLInputElement>('input[type=file]'); if (input) input.value = '';
      }}>Remove photos</button></p>}</div>}
      {step === 4 && <>
        <label className="check"><input type="checkbox" {...form.register('anonymous')} /> Submit anonymously</label>
        {!anonymous && <label className="field">Preferred contact (optional)<input {...form.register('contact')} maxLength={120} placeholder="Use sample details only" /><small className="muted">Contact details are discarded when the demo report is saved.</small></label>}
        <label className="check"><input type="checkbox" {...form.register('consent')} /> I understand the demo stores the report on this device and shows a public status timeline without reporter details.</label>{error('consent')}
      </>}
      {step === 5 && <dl className="flow-tight">
        <div><dt className="muted">Issue type</dt><dd>{current.category}</dd></div>
        <div><dt className="muted">Location</dt><dd>{current.location}, {wardName(current.ward)}</dd></div>
        <div><dt className="muted">Description</dt><dd className="break-words">{current.description}</dd></div>
        <div><dt className="muted">Photos</dt><dd>{attachments.length}</dd></div>
      </dl>}
      <div className="button-row">{step > 0 && <button type="button" className="quiet-button" onClick={() => { setStep(previous => previous - 1); form.clearErrors(); requestAnimationFrame(() => title.current?.focus()); }}>Back</button>}
        <button className="btn" type="submit">{step === 5 ? 'Submit demo report' : 'Continue'}</button></div>
    </form>
  </div>;
}

export function CaseTracker({ sample = false }: { sample?: boolean }) {
  return <Suspense fallback={<p role="status">Loading the report tracker…</p>}><Tracker sample={sample} /></Suspense>;
}
function Tracker({ sample }: { sample: boolean }) {
  const params = useSearchParams();
  const cases = useSimulation().cases;
  const [input, setInput] = useState(params.get('reference') || (sample ? 'LUG-84721' : ''));
  const [reference, setReference] = useState(input.toUpperCase().trim());
  const report = cases.find(entry => entry.reference === reference);
  return <div className="flow">
    <form className="panel flow-tight" onSubmit={event => { event.preventDefault(); setReference(input.toUpperCase().trim()); }}>
      <label className="field">Case reference<input value={input} onChange={event => setInput(event.target.value)} placeholder="LUG-84721" maxLength={24} required /></label>
      <div className="button-row"><button className="btn">Find report</button><button type="button" className="quiet-button" onClick={() => { setInput('LUG-84721'); setReference('LUG-84721'); }}>Try a sample reference</button></div>
    </form>
    {report ? <section className="panel flow" aria-live="polite">
      <div className="split"><h2>{report.reference}</h2><span className="status">{report.status}</span></div>
      <p className="muted">{report.category} · {wardName(report.ward)}</p>
      <ol className="timeline">{report.updates.map((update, index) => <li key={update.date + index}><strong>{update.status}</strong><p className="muted small">{formatDate(update.date)}</p><p>{update.response}</p></li>)}</ol>
    </section> : reference && <Empty title="Report reference unavailable"><p className="muted">Check the reference and open the tracker in the browser where the report was submitted.</p></Empty>}
  </div>;
}
export function CopyButton({ value, label = 'Copy link' }: { value?: string; label?: string }) {
  const [message, setMessage] = useState('');
  return <div><button type="button" className="quiet-button" onClick={async () => {
    const text = value ?? window.location.href;
    try { await navigator.clipboard.writeText(text); setMessage('Copied'); }
    catch { setMessage('Copy manually: ' + text); }
  }}><Clipboard size={16} />{label}</button>{message && <p role="status" className="small muted break-all">{message}</p>}</div>;
}
export function DetailActions({ href, title, kind }: { href: string; title: string; kind: string }) {
  const state = useSimulation();
  const [feedback, setFeedback] = useState('');
  function share(network: 'facebook' | 'whatsapp') {
    const url = new URL(href, window.location.origin).href;
    const target = network === 'facebook' ? 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url) : 'https://wa.me/?text=' + encodeURIComponent(title + ' ' + url);
    window.open(target, '_blank', 'noopener,noreferrer');
  }
  return <div className="flow-tight">
    <div className="button-row no-print">
      <button type="button" className="quiet-button" aria-pressed={state.saved.includes(href)} onClick={() => { toggleList('saved', href); setFeedback(state.saved.includes(href) ? 'Removed from saved items.' : 'Saved on this device.'); }}><Save size={16} />{state.saved.includes(href) ? 'Saved' : 'Save'}</button>
      {(kind === 'events' || kind === 'opportunities') && <button type="button" className="quiet-button" aria-pressed={state.reminders.includes(href)} onClick={() => { toggleList('reminders', href); setFeedback(state.reminders.includes(href) ? 'Reminder removed.' : 'Reminder added to the demo account.'); }}><CalendarPlus size={16} />{state.reminders.includes(href) ? 'Reminder set' : 'Set reminder'}</button>}
      {kind === 'events' && <button type="button" className="quiet-button" aria-pressed={state.responses.includes(href)} onClick={() => { toggleList('responses', href); setFeedback(state.responses.includes(href) ? 'Demo RSVP cancelled.' : 'Demo RSVP recorded on this device.'); }}>{state.responses.includes(href) ? 'Cancel demo RSVP' : 'Demo RSVP'}</button>}
      <CopyButton /><button type="button" className="quiet-button" onClick={() => share('whatsapp')}><Share2 size={16} />WhatsApp</button>
      <button type="button" className="quiet-button" onClick={() => share('facebook')}>Facebook</button>
    </div>
    {feedback && <p role="status" className="success small">{feedback}</p>}
  </div>;
}

export function IntakeForm({ bucket, subject, label, includeWard = true }: { bucket: string; subject?: string; label: string; includeWard?: boolean }) {
  const [notice, setNotice] = useState('');
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = subject || String(data.get('subject') || '').trim();
    const body = String(data.get('details') || '').trim();
    const ward = String(data.get('ward') || '');
    if (!title || body.length < 10) { setNotice('Add a subject and at least 10 characters of detail.'); return; }
    saveItem(bucket, { id: newId(), title, body, ward, category: bucket, date: new Date().toISOString(), status: 'Received' });
    event.currentTarget.reset();
    setNotice('Saved on this device in demo mode.');
  }
  return <form className="panel flow" onSubmit={submit}><h3>{label}</h3>
    {!subject && <label className="field">Subject<input name="subject" required maxLength={130} /></label>}
    {includeWard && <label className="field">Ward<select name="ward"><option value="">All or unspecified</option>{tenant.wards.map(ward => <option key={ward.slug} value={ward.slug}>{ward.name}</option>)}</select></label>}
    <label className="field">Details<textarea name="details" required minLength={10} maxLength={1200} placeholder="Use sample details and leave out personal information." /></label>
    <button type="submit" className="btn">Submit in demo</button>{notice && <p role="status">{notice}</p>}
  </form>;
}
