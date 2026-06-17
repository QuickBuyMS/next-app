'use client';

/**
 * Root page — redirects to /products (the landing page)
 */
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getItem } from '@/utils/localStorage';
import Loader from '@/components/ui/Loader';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/products');
  }, [router]);

  return <Loader message="Redirecting..." />;
}
