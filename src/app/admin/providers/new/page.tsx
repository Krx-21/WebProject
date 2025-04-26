'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/services/auth.service';

export default function NewProviderPage() {
  const router = useRouter();
  
  useEffect(() => {
    const user = getCurrentUser();
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (user.role === 'admin') {
      router.push('/admin/cars');
    } else if (user.role === 'provider') {
      router.push('/dashboard');
    } else {
      router.push('/');
    }
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting...</p>
    </div>
  );
}
