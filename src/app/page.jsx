/**
 * Root page — server-side redirect to /products (the landing page)
 * Uses Next.js redirect() for instant 307 redirect at the edge,
 * avoiding the client-side useEffect → router.replace cycle
 * which would hurt LCP/FCP.
 */
import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/products');
}
