import type { MetadataRoute } from 'next';
import { baseUrl } from '@/lib/tenant';
export const dynamic = 'force-static';
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: '/', disallow: ['/admin/', '/portal/', '/account/', '/report/status/', '/search/'] }, sitemap: new URL('/sitemap.xml', baseUrl).href };
}
