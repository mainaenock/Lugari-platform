import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/manrope/wght.css';
import './globals.css';
import { baseUrl, tenant } from '@/lib/tenant';
import { Footer, Header } from '@/components/layout';
import { CookieConsent, PreferenceBridge } from '@/components/preferences';

const description = 'Find development projects, jobs, bursaries, services and community updates across Lugari’s six wards.';
export const metadata: Metadata = {
  metadataBase: baseUrl, title: { default: tenant.domain + ' | Everything Lugari. One place.', template: '%s | ' + tenant.domain },
  description, applicationName: tenant.name, manifest: '/manifest.webmanifest',
  openGraph: { type: 'website', locale: 'en_KE', siteName: tenant.domain, title: tenant.name, description, images: ['/media/hero-960.webp'] },
  twitter: { card: 'summary_large_image', title: tenant.name, description, images: ['/media/hero-960.webp'] },
  icons: { icon: '/mark.svg', apple: '/icon-192.png' },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#122e24', viewportFit: 'cover' };

const restorePreferences = 'try{const p=JSON.parse(localStorage.getItem("lugari-platform:v1")||"null")?.preferences;if(p){document.documentElement.dataset.theme=p.theme==="dark"?"dark":"light";document.documentElement.dataset.saver=p.saver?"on":"off";document.documentElement.lang=p.language==="sw"?"sw":"en"}}catch{}';
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-KE" suppressHydrationWarning><head>
    {/* Preferences are restored before the browser paints the first frame. */}
    <script dangerouslySetInnerHTML={{ __html: restorePreferences }} />
  </head><body>
    <PreferenceBridge /><Header /><main id="main" tabIndex={-1}>{children}</main><Footer /><CookieConsent />
  </body></html>;
}
