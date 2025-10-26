'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { verifyCheckoutSession } from '@/actions/actions';

import '../../globals.css';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [sessionData, setSessionData] = useState<{
    customer_email?: string;
    amount_total?: number;
  } | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      setStatus('error');
      return;
    }

    const verify = async () => {
      try {
        const result = await verifyCheckoutSession(sessionId);
        
        if (result && result.status === 'complete') {
          setSessionData(result);
          setStatus('success');
          // Clear the cart
          localStorage.removeItem('cart');
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
      }
    };

    verify();
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <main className="container" style={{ textAlign: 'center', padding: '2rem' }}>
        <h1>Fizetés ellenőrzése...</h1>
        <p>Kérjük, várjon...</p>
      </main>
    );
  }

  if (status === 'error') {
    return (
      <main className="container" style={{ textAlign: 'center', padding: '2rem' }}>
        <h1>Hiba történt</h1>
        <p>A fizetés ellenőrzése sikertelen volt.</p>
        <Link href="/cart" className="btn btn-blue" style={{ marginTop: '1rem', display: 'inline-block' }}>
          Vissza a kosárhoz
        </Link>
      </main>
    );
  }

  return (
    <main className="container" style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>✅ Sikeres fizetés!</h1>
      <p>Köszönjük a rendelését!</p>
      
      {sessionData?.amount_total && (
        <p>
          Fizetett összeg:{' '}
          {new Intl.NumberFormat('hu-HU', {
            style: 'currency',
            currency: 'HUF'
          }).format(sessionData.amount_total)}
        </p>
      )}
      
      {sessionData?.customer_email && (
        <p>Visszaigazolást küldtünk a következő címre: {sessionData.customer_email}</p>
      )}
      
      <Link href="/" className="btn btn-blue" style={{ marginTop: '2rem', display: 'inline-block' }}>
        Vissza a főoldalra
      </Link>
    </main>
  );
}
