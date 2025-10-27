'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { verifyCheckoutSession } from '@/actions/actions';
import styles from './page.module.css';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
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
      <div className={styles.page}>
        <main className={styles.main}>
          <div className={styles.messageContainer}>
            <div className={styles.messageContent}>
              <div className={styles.spinner}></div>
              <h1>Fizetés ellenőrzése...</h1>
              <p className={styles.thankYou}>
                Kérjük, várjon, amíg feldolgozzuk a tranzakciót.
              </p>
            </div>s
          </div>
        </main>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <div className={styles.messageContainer}>
            <div className={styles.messageContent}>
              <div className={styles.icon}>❌</div>
              <h1>Hiba történt</h1>
              <p className={styles.thankYou}>
                A fizetés ellenőrzése sikertelen volt.
              </p>
              <div className={styles.actions}>
                <Link href="/cart" className={styles.button}>
                  Vissza a kosárhoz
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.messageContainer}>
          <div className={styles.messageContent}>
            <div className={styles.icon}>✅</div>
            <h1>Sikeres fizetés!</h1>
            <p className={styles.thankYou}>Köszönjük a rendelését!</p>

            {sessionData?.amount_total && (
              <div className={styles.orderAmount}>
                <h3>Fizetett összeg</h3>
                <p className={styles.amount}>
                  {new Intl.NumberFormat('hu-HU', {
                    style: 'currency',
                    currency: 'HUF'
                  }).format(sessionData.amount_total)}
                </p>
              </div>
            )}

            {sessionData?.customer_email && (
              <div className={styles.emailConfirmation}>
                <p>Visszaigazolást küldtünk a következő címre:</p>
                <p className={styles.email}>{sessionData.customer_email}</p>
              </div>
            )}

            <div className={styles.actions}>
              <Link href="/" className={styles.button}>
                Vissza a főoldalra
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
