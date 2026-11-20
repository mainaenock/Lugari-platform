import { baseUrl, tenant } from '@/lib/tenant';
import type { Resource } from '@/lib/types';

export function StructuredBreadcrumb({ path, title, parent, item }: { path: string; title: string; parent?: { label: string; href: string }; item?: Resource }) {
  const entries = [
    { name: tenant.shortName, item: baseUrl.href },
    ...(parent ? [{ name: parent.label, item: new URL(parent.href, baseUrl).href }] : []),
    { name: title, item: new URL(path, baseUrl).href },
  ];
  const data = [{ '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: entries.map((entry, index) => ({ '@type': 'ListItem', position: index + 1, ...entry })),
  }];
  const schema = item && item.trust !== 'Demo data' && (item.kind === 'news' ? 'Article' : item.kind === 'organizations' ? 'Organization' : undefined);
  const records: unknown[] = schema ? [...data, { '@context': 'https://schema.org', '@type': schema,
    name: item.title, headline: item.title, description: item.summary, url: new URL(path, baseUrl).href, datePublished: item.date?.length === 10 ? item.date : undefined,
  }] : data;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(records).replace(/</g, '\\u003c') }} />;
}
