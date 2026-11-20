'use client';
import Link from '@/components/link';

export default function Error({ reset }: { reset: () => void }) {
  return <div className="wrap section flow"><h1>Something went wrong</h1><p className="lead">Try loading this page again.</p><div className="button-row"><button className="btn" onClick={reset}>Try again</button><Link href="/" className="quiet-button">Homepage</Link></div></div>;
}
