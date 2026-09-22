/**
 * Sign-in page — Server Component wrapper
 *
 * Performance: Removed 'use client'. This page only composes
 * SigninForm inside Suspense — both of which work from a Server Component.
 * SigninForm itself is already 'use client'. This reduces the client bundle.
 */
import { Suspense } from 'react';
import SigninForm from '@/components/auth/SigninForm';
import Loader from '@/components/ui/Loader';

export default function SigninPage() {
  return (
    <Suspense fallback={<Loader message="Loading..." />}>
      <SigninForm />
    </Suspense>
  );
}
