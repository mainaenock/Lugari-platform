import type { MetadataRoute } from 'next';
import { tenant } from '@/lib/tenant';
export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return { name: tenant.name, short_name: tenant.shortName, description: 'Local services, projects and opportunities across Lugari.',
    start_url: '/', scope: '/', display: 'standalone', background_color: '#f7f8f2', theme_color: '#122e24',
    icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }],
  };
}
