'use client';

import { redirect } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { logoutById } from '@/lib/api';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  // console.log('ProtectedLayout session', session);
  // console.log('ProtectedLayout status', status);

  useEffect(() => {
    const checkSession = async () => {
      if (status === 'loading') return;

      if (!session) {
        redirect('/login');
      }

      if (session?.error === 'RefreshTokenError') {
        await logoutById(session.user.id);
        await signOut({ callbackUrl: '/login' });
      }
    };
    checkSession();
  }, [session]);

  return <>{children}</>;
}
