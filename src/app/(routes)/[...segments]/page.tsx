import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from '@/components/link';
import { enabledPath, tenant } from '@/lib/tenant';
import { directories, isDirectory, publicPages } from '@/lib/routes';
import { privateGroups } from '@/lib/navigation';
import { catalog, resourceUrl, wardLinks } from '@/services/catalog';
import { PageHeading } from '@/components/content';
import { ResourceDetail } from '@/components/detail';
import { PublicPage } from '@/components/public-pages';
import { WardPage, Wards } from '@/components/places';
import { Workspace, type Area } from '@/components/workspace';
import { StructuredBreadcrumb } from '@/components/route-metadata';

type Props = { params: Promise<{ segments: string[] }> };
export const dynamicParams = false;

export function generateStaticParams() {
  const publicPaths = Object.keys(publicPages);
  const directoryPaths = Object.keys(directories);
  const wards = wardLinks().map(ward => 'wards/' + ward.slug);
  const records = catalog.list().map(resource => resourceUrl(resource).slice(1, -1));
  const privatePaths = (Object.keys(privateGroups) as Area[]).flatMap(area => [
    area, ...privateGroups[area].flatMap(([, slug]) => slug ? [area + '/' + slug] : []),
  ]);
  return [...new Set([...publicPaths, ...directoryPaths, ...wards, ...records, ...privatePaths])].filter(enabledPath).map(path => ({ segments: path.split('/') }));
}

function findPage(segments: string[]) {
  const [first, second] = segments;
  const path = segments.join('/');
  if (!enabledPath(path)) return undefined;
  const canonical = '/' + path + '/';
  if (Object.hasOwn(privateGroups, first) && segments.length <= 2) {
    const area = first as Area;
    const section = second || (area === 'account' ? '' : 'dashboard');
    const label = privateGroups[area].find(([, slug]) => slug === section)?.[0];
    if (label) return { type: 'workspace' as const, title: area === 'account' && !section ? 'Your Lugari account' : label, area, section, index: false, canonical };
  }
  if (segments.length === 2 && first === 'wards') {
    const ward = tenant.wards.find(item => item.slug === second);
    if (ward) return { type: 'ward' as const, title: ward.name + ' Ward', intro: ward.summary, ward, canonical, index: true };
  }
  if (segments.length === 2 && isDirectory(first)) {
    const item = catalog.find(first, second);
    if (item) return { type: 'record' as const, title: item.title, intro: item.summary, item, canonical, index: item.trust !== 'Demo data' };
  }
  if (isDirectory(path)) {
    const entry = directories[path];
    return { type: 'public' as const, title: entry.title, intro: entry.intro, path, canonical, index: true };
  }
  if (Object.hasOwn(publicPages, path)) {
    const [title, intro] = publicPages[path];
    return { type: 'public' as const, title, intro, path, canonical, index: !['search', 'offline', 'sign-in', 'register'].includes(path) && !path.startsWith('report/status') };
  }
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = findPage((await params).segments);
  if (!page) return { title: 'Page unavailable', robots: { index: false } };
  const description = 'intro' in page ? page.intro : 'Demonstration workspace for Lugari Digital Infrastructure.';
  const image = page.type === 'record' && page.item.image ? page.item.image.src + '-960.webp' : '/media/hero-960.webp';
  return { title: page.title, description, alternates: { canonical: page.canonical }, robots: { index: page.index, follow: true },
    openGraph: { title: page.title, description, url: page.canonical, images: [image], type: page.type === 'record' && page.item.kind === 'news' ? 'article' : 'website', siteName: tenant.domain },
    twitter: { card: 'summary_large_image', title: page.title, description, images: [image] },
  };
}
export default async function Page({ params }: Props) {
  const segments = (await params).segments;
  const page = findPage(segments);
  if (!page) notFound();
  if (page.type === 'workspace') {
    if (segments.length === 1 && page.area !== 'account') redirect('/' + page.area + '/dashboard/');
    return <><PageHeading title={page.title} intro={page.area === 'portal' ? 'Institution workspace · Demonstration mode' : page.area === 'admin' ? 'Platform administration · Demonstration mode' : 'Manage your ward, preferences and demo activity.'}>
      {page.area !== 'account' && <Link className="chip" href="/sign-in/">Switch demo role</Link>}
    </PageHeading><div className="wrap section"><Workspace area={page.area} section={page.section} /></div></>;
  }
  if (page.type === 'ward') return <><StructuredBreadcrumb path={page.canonical} title={page.title} parent={{ label: 'Wards', href: '/wards/' }} /><WardPage ward={page.ward} /></>;
  if (page.type === 'record') return <><StructuredBreadcrumb path={page.canonical} title={page.title} parent={{ label: directories[page.item.kind].title, href: '/' + page.item.kind + '/' }} item={page.item} /><ResourceDetail item={page.item} /></>;
  if (page.path === 'wards') return <Wards />;
  return <>{page.index && <StructuredBreadcrumb path={page.canonical} title={page.title} />}<PublicPage path={page.path} /></>;
}
