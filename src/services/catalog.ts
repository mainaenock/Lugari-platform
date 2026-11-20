import { resources } from '@/data/resources';
import { matches } from '@/lib/format';
import { enabledPath, tenant, wardName } from '@/lib/tenant';
import type { Resource, ResourceKind } from '@/lib/types';

export const resourceUrl = (resource: Resource) => '/' + resource.kind + '/' + resource.slug + '/';
export const resourceSearchText = (resource: Resource) => [
  resource.title, resource.summary, resource.category, resource.location, wardName(resource.ward), resource.organization,
  resource.status, resource.source.name, ...(resource.keywords ?? []),
].filter(Boolean).join(' ');

export interface Catalog {
  list(kind?: ResourceKind, ward?: string): Resource[];
  find(kind: string, slug: string): Resource | undefined;
  search(query: string): Resource[];
}

export const catalog: Catalog = {
  list: (kind, ward) => resources.filter(resource => enabledPath(resource.kind) && (!kind || resource.kind === kind) && (!ward || resource.ward === ward)),
  find: (kind, slug) => resources.find(resource => enabledPath(kind) && resource.kind === kind && resource.slug === slug),
  search: query => query.trim() ? resources.filter(resource => enabledPath(resource.kind) && matches(resourceSearchText(resource), query)) : [],
};
export const wardLinks = () => tenant.wards.map(ward => ({ ...ward, href: '/wards/' + ward.slug + '/' }));
