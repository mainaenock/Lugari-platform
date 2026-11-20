export interface Ward { slug: string; name: string; summary: string; approximatePopulation?: number; areaKm2?: number }
export interface Tenant {
  id: string; name: string; shortName: string; domain: string; county: string; country: string;
  wards: Ward[]; features: { marketplace: boolean; ussd: boolean; live: boolean; talent: boolean; agriculture: boolean; politicalAds: boolean };
}
const lugari: Tenant = {
  id: 'lugari', name: 'Lugari Digital Infrastructure', shortName: 'Lugari', domain: 'lugari.ke',
  county: 'Kakamega', country: 'Kenya',
  wards: [
    { slug: 'lumakanda', name: 'Lumakanda', approximatePopulation: 29955, areaKm2: 59, summary: 'Home to the constituency headquarters and a starting point for local services.' },
    { slug: 'lugari', name: 'Lugari', approximatePopulation: 31381, areaKm2: 81.3, summary: 'Find local development records, school updates and community activities in Lugari Ward.' },
    { slug: 'mautuma', name: 'Mautuma', approximatePopulation: 25082, areaKm2: 83.8, summary: 'Follow local electricity and school improvements and find ways to participate.' },
    { slug: 'chekalini', name: 'Chekalini', approximatePopulation: 19705, areaKm2: 41.7, summary: 'Explore local services, including updates on water and public facilities.' },
    { slug: 'chevaywa', name: 'Chevaywa', approximatePopulation: 33145, areaKm2: 57, summary: 'Follow local education infrastructure and look for training opportunities.' },
    { slug: 'lwandeti', name: 'Lwandeti', approximatePopulation: 27746, areaKm2: 44.2, summary: 'Find local directory listings, events and ways to raise a concern.' },
  ],
  features: { marketplace: true, ussd: true, live: true, talent: true, agriculture: true, politicalAds: false },
};
const supportedTenants: Record<string, Tenant> = { lugari };
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID || 'lugari';
if (!Object.hasOwn(supportedTenants, tenantId)) throw new Error('Unknown configured tenant: ' + tenantId);
export const tenant = supportedTenants[tenantId];
const routeFeatures: Partial<Record<string, keyof Tenant['features']>> = {
  marketplace: 'marketplace', ussd: 'ussd', live: 'live', talent: 'talent', agriculture: 'agriculture',
};
export function enabledPath(path: string) {
  const [section, nested] = path.split('?')[0].split('/').filter(Boolean);
  const option = routeFeatures[section === 'access' ? nested : section];
  return !option || tenant.features[option];
}
export const baseUrl = new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://' + tenant.domain);
export const wardName = (slug?: string) => tenant.wards.find(ward => ward.slug === slug)?.name;
export const constituencySource = 'https://lugari.ngcdf.go.ke/about-us/';
export const countySource = 'https://kakamega.go.ke/constituencies/';
export const wardStatisticsSource = 'https://kakamega.go.ke/lugari/';
