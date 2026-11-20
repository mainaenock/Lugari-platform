import type { MetadataRoute } from 'next';
import { directories, publicPages } from '@/lib/routes';
import { baseUrl, enabledPath } from '@/lib/tenant';
import { catalog, resourceUrl, wardLinks } from '@/services/catalog';

export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap {
  const publicPaths = Object.keys(publicPages).filter(path => !['sign-in', 'register', 'search', 'offline'].includes(path) && !path.startsWith('report/status'));
  return [
    '/', ...[...Object.keys(directories), ...publicPaths].map(path => '/' + path + '/'),
    ...wardLinks().map(ward => ward.href),
    ...catalog.list().filter(item => item.trust !== 'Demo data').map(resourceUrl),
  ].filter(enabledPath).map(path => ({ url: new URL(path, baseUrl).href }));
}
