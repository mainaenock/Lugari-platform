import Link from '@/components/link';
import { PageHeading } from '@/components/content';

export default function NotFound() {
  return <><PageHeading title="Page unavailable" intro="This page may have moved or the link may be incomplete." /><div className="wrap section button-row">
    <Link href="/" className="btn">Go to the homepage</Link><Link href="/search/" className="quiet-button">Search Lugari</Link><Link href="/contact/" className="text-link">Contact the platform</Link>
  </div></>;
}
