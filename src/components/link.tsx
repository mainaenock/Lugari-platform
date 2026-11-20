import NextLink from 'next/link';
import type { ComponentProps } from 'react';
import { enabledPath } from '@/lib/tenant';

export default function Link(props: ComponentProps<typeof NextLink>) {
  if (typeof props.href === 'string' && props.href.startsWith('/') && !enabledPath(props.href)) return null;
  return <NextLink prefetch={false} {...props} />;
}
