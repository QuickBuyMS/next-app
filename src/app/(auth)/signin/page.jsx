'use client';

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
