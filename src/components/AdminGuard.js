'use client';

import { usePiAuth } from 'context/PiAuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminGuard({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'admin') {
      router.push('/admin/login');
    }
  }, [session, status, router]);

  if (status === 'loading' || !session) return <div className="text-center text-white py-10">Loading...</div>;

  return children;
}
