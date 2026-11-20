'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from '@/components/link';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, BriefcaseBusiness, ChevronDown, CircleAlert, House, MapPin, Menu, Moon, Search, Signal, Sun, UserRound, X } from 'lucide-react';
import { groups, footerLinks } from '@/lib/navigation';
import { tenant } from '@/lib/tenant';
import { translate } from '@/lib/strings';
import { rememberSearch, setPreference, useSimulation } from '@/services/local';
import { MyWardLink, Translate } from './preferences';

export function Brand() {
  return <Link className="brand" href="/" aria-label={tenant.shortName + ' homepage'}>
    <span className="brand-mark"><MapPin size={24} strokeWidth={2.4} aria-hidden="true" /></span>
    <span>{tenant.shortName}<b>.ke</b><small>COMMUNITY PLATFORM</small></span>
  </Link>;
}

export function SearchBar({ compact = false, onSearch, initial }: { compact?: boolean; onSearch?: () => void; initial?: string }) {
  const router = useRouter();
  const { preferences } = useSimulation();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = String(new FormData(event.currentTarget).get('q') ?? '').trim();
    if (!query) return;
    rememberSearch(query);
    onSearch?.();
    router.push('/search/?q=' + encodeURIComponent(query));
  }
  return <form role="search" className={'searchbar' + (compact ? ' compact' : '')} action="/search/" onSubmit={submit}>
    <Search size={22} aria-hidden="true" />
    <input aria-label="Search Lugari" placeholder={translate(preferences.language, 'Search Lugari…')} name="q" type="search" defaultValue={initial} maxLength={100} required />
    <button className="btn" type="submit"><Translate>Search</Translate></button>
  </form>;
}

export function Header() {
  const state = useSimulation();
  const path = usePathname();
  const [menu, setMenu] = useState<'explore' | 'mobile' | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const open = () => { if (!dialog.current?.open) dialog.current?.showModal(); };
  const close = () => dialog.current?.close();
  useEffect(() => {
    function keyboard(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        open();
      }
      if (event.key === 'Escape') setMenu(null);
    }
    window.addEventListener('keydown', keyboard);
    return () => window.removeEventListener('keydown', keyboard);
  }, []);
  const t = (text: string) => translate(state.preferences.language, text);
  const account = state.role === 'institution' ? '/portal/dashboard/' : state.role === 'admin' ? '/admin/dashboard/' : state.role === 'resident' ? '/account/' : '/sign-in/';
  return <>
    <a className="skip-link" href="#main"><Translate>Skip to content</Translate></a>
    <div className="utility"><div className="wrap utility-inner">
      <span><MapPin size={13} aria-hidden="true" /> {tenant.county} County, {tenant.country}</span>
      <div>
        <button type="button" className="plain utility-button" aria-pressed={state.preferences.saver} onClick={() => setPreference('saver', !state.preferences.saver)}><Signal size={15} /> {t('Data saver')}{state.preferences.saver && ' · On'}</button>
        <button type="button" className="plain utility-button" onClick={() => setPreference('language', state.preferences.language === 'en' ? 'sw' : 'en')} aria-label={state.preferences.language === 'en' ? 'Switch to Kiswahili' : 'Switch to English'}>{state.preferences.language === 'en' ? 'EN' : 'SW'} <ChevronDown size={13} /></button>
        <button type="button" className="plain utility-button theme-toggle" aria-label="Dark theme" aria-pressed={state.preferences.theme === 'dark'} onClick={() => setPreference('theme', state.preferences.theme === 'dark' ? 'light' : 'dark')}>{state.preferences.theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}</button>
      </div>
    </div></div>
    <header className="main-header"><div className="wrap navigation">
      <Brand />
      <nav aria-label="Main navigation" className="desktop-nav">
        <button type="button" className="plain" aria-expanded={menu === 'explore'} aria-controls="site-menu" onClick={() => setMenu(menu === 'explore' ? null : 'explore')}>{t('Explore')} <ChevronDown size={14} /></button>
        <Link aria-current={path.startsWith('/projects') ? 'page' : undefined} href="/projects/">{t('Development')}</Link>
        <Link aria-current={path.startsWith('/opportunities') ? 'page' : undefined} href="/opportunities/">{t('Opportunities')}</Link>
        <Link href="/businesses/">{t('Businesses')}</Link><Link href="/community/">{t('Community')}</Link>
        <MyWardLink><MapPin size={15} />{t('My ward')}</MyWardLink>
      </nav>
      <div className="header-actions">
        <button className="icon-button" type="button" onClick={open} aria-label={t('Search')}><Search size={21} /></button>
        <Link className="icon-button mobile-only" href="/alerts/" aria-label={t('Alerts')}><Bell size={21} /></Link>
        <Link className="btn btn-small header-report" href="/report/">{t('Report an issue')}</Link>
        <Link className="account-link" href={account} aria-label={t(state.role ? 'Account' : 'Sign in')} title={t(state.role ? 'Account' : 'Sign in')}><UserRound size={19} /><span>{t(state.role ? 'Account' : 'Sign in')}</span></Link>
        <button type="button" className="icon-button mobile-only" aria-expanded={menu === 'mobile'} aria-controls="site-menu" aria-label={t('Menu')} onClick={() => setMenu(menu === 'mobile' ? null : 'mobile')}>{menu === 'mobile' ? <X /> : <Menu />}</button>
      </div>
    </div>
    {menu && <div id="site-menu" className="mega">
      <div className="wrap mega-grid">
        {groups.map(group => menu === 'mobile' ? <details key={group.title}><summary>{t(group.title)}</summary>
          {group.links.map(([label, href]) => <Link key={href} href={href} onClick={() => setMenu(null)}>{t(label)}</Link>)}
        </details> : <section key={group.title}><h2>{t(group.title)}</h2>{group.links.map(([label, href]) => <Link key={href} href={href} onClick={() => setMenu(null)}>{t(label)}</Link>)}</section>)}
        {menu === 'mobile' && <Link href={account} onClick={() => setMenu(null)}>{t(state.role ? 'Account' : 'Sign in')}</Link>}
      </div>
    </div>}
    </header>
    <nav className="bottom-nav" aria-label="Mobile shortcuts">
      <Link aria-current={path === '/' ? 'page' : undefined} href="/"><House size={20} />{t('Home')}</Link>
      <MyWardLink><MapPin size={20} />{t('My ward')}</MyWardLink>
      <Link href="/opportunities/"><BriefcaseBusiness size={20} />{t('Opportunities')}</Link>
      <Link href="/report/"><CircleAlert size={20} />{t('Report')}</Link>
      <button type="button" className="plain" aria-expanded={menu === 'mobile'} onClick={() => { setMenu(menu === 'mobile' ? null : 'mobile'); window.scrollTo({ top: 0 }); }}><Menu size={20} />{t('Menu')}</button>
    </nav>
    <dialog className="dialog" ref={dialog} aria-labelledby="global-search-title" onClick={event => { if (event.target === dialog.current) close(); }}>
      <div className="dialog-inner">
        <div className="split"><h2 id="global-search-title">{t('Search')} {tenant.shortName}</h2><button className="icon-button" type="button" onClick={close} aria-label={t('Close')}><X /></button></div>
        <SearchBar compact onSearch={close} />
        <p className="eyebrow">{state.recent.length ? 'Recent searches' : 'Popular searches'}</p>
        <div className="chip-row">{(state.recent.length ? state.recent : ['Bursary', 'Teacher jobs', 'Mautuma transformer', 'Road project']).map(query => <Link className="chip" href={'/search/?q=' + encodeURIComponent(query)} onClick={close} key={query}>{query}</Link>)}</div>
      </div>
    </dialog>
  </>;
}

export function Footer() {
  return <footer className="site-footer"><div className="wrap footer-grid">
    <div><Brand /><p>An independent community platform for {tenant.shortName}, {tenant.county} County, Kenya.</p><p>For government services and official applications, use the linked public offices.</p></div>
    {groups.slice(0, 3).map(group => <div key={group.title}><h2>{group.title}</h2>{group.links.slice(0, 5).map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}</div>)}
    <div><h2>Platform</h2>{footerLinks.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</div>
  </div><div className="wrap footer-bottom"><span>© {tenant.domain}</span><span>Independent of the Government of Kenya.</span><Link href="/sign-in/">Demo workspaces</Link></div></footer>;
}
