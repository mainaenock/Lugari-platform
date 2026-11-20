'use client';

import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { ArrowUpRight, Check, MapPin } from 'lucide-react';
import Link from '@/components/link';
import { useRouter } from 'next/navigation';
import { tenant } from '@/lib/tenant';
import { translate } from '@/lib/strings';
import { setPreference, useSimulation } from '@/services/local';
import type { MediaAsset } from '@/lib/types';

export function Translate({ children }: { children: string }) {
  return translate(useSimulation().preferences.language, children);
}

export function PreferenceBridge() {
  const { preferences } = useSimulation();
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = preferences.theme;
    root.dataset.saver = preferences.saver ? 'on' : 'off';
    root.lang = preferences.language;
  }, [preferences]);
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);
  return null;
}

export function WardPicker({ button = 'Go', action = 'view', initial = '' }: { button?: string; action?: 'view' | 'save'; initial?: string }) {
  const router = useRouter();
  const { preferences } = useSimulation();
  const [selection, setSelection] = useState('');
  const value = selection || initial || preferences.ward;
  return <form className="ward-picker" onSubmit={event => {
    event.preventDefault();
    if (!value) return;
    setPreference('ward', value);
    if (action === 'view') router.push('/wards/' + value + '/');
  }}>
    <MapPin aria-hidden="true" size={19} />
    <label className="sr-only" htmlFor={action + '-ward'}><Translate>Select your ward</Translate></label>
    <select id={action + '-ward'} value={value} onChange={event => setSelection(event.target.value)} required>
      <option value="">{translate(preferences.language, 'Select your ward')}</option>
      {tenant.wards.map(ward => <option key={ward.slug} value={ward.slug}>{ward.name}</option>)}
    </select>
    <button className="quiet-button" disabled={!value}><Translate>{button}</Translate></button>
    {action === 'save' && preferences.ward && <Check size={17} aria-label="Ward saved" />}
  </form>;
}

const useDay = () => useSyncExternalStore(
  subscribeDay, () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Africa/Nairobi' }), () => '',
);
function subscribeDay(listener: () => void) {
  const timer = window.setInterval(listener, 30_000);
  return () => window.clearInterval(timer);
}
export function DeadlineTag({ date }: { date: string }) {
  const today = useDay();
  if (!today) return null;
  const days = (Date.parse(date) - Date.parse(today)) / 86_400_000;
  if (days < 0) return <span className="status" data-tone="neutral">Closed</span>;
  if (days <= 7) return <span className="status" data-tone="warm">Closing soon</span>;
  return null;
}

export function LocalImage({ media, mode = 'card' }: { media: MediaAsset; mode?: 'card' | 'gallery' }) {
  const { preferences } = useSimulation();
  if (preferences.saver) return null;
  return <div className={'picture picture-' + mode}>
    {/* Pre-encoded WebP variants keep the static export independent of an image server. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img className="resource-image" src={media.src + '-960.webp'}
      srcSet={mode === 'card' ? media.src + '-480.webp 480w, ' + media.src + '-960.webp 960w' : undefined}
      sizes={mode === 'card' ? '(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 375px' : undefined}
      alt={media.alt} loading="lazy" decoding="async" />
  </div>;
}

export function MyWardLink({ children, className }: { children: ReactNode; className?: string }) {
  const { preferences } = useSimulation();
  return <Link className={className} href={preferences.ward ? '/wards/' + preferences.ward + '/' : '/wards/'}>{children}</Link>;
}

export function CookieConsent() {
  const { preferences } = useSimulation();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 1500);
    return () => window.clearTimeout(timer);
  }, []);
  if (!visible || preferences.consent) return null;
  return <aside className="cookie-banner" aria-label="Privacy preferences">
    <p><strong>Your privacy choices</strong><br />Site preferences are stored on this device.</p>
    <div className="button-row">
      <Link className="quiet-button" href="/privacy/">Manage settings <ArrowUpRight size={14}/></Link>
      <button className="btn btn-small" onClick={() => setPreference('consent', { analytics: false, personalization: false, marketing: false })}>Use essential only</button>
    </div>
  </aside>;
}
