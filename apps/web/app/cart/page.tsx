'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';

import '../globals.css';
import styles from './page.module.css';
import CartElement from '@/components/CartElement';
import { getSubtotal, createCheckoutSession } from '@/actions/actions';
import Navbar from '@/components/Navbar';

export default function CartPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [subtotal, setSubtotal] = useState({
    subtotal: 0,
    vat: 0
  });

  const [cart, setCart] = useState<
    {
      id: string;
      date: { year: number; week: number; day: number };
    }[]
  >([]);
  
  useEffect(() => {
    const storedCart: {
      id: string;
      date: { year: number; week: number; day: number };
    }[] = JSON.parse(localStorage.getItem('cart') || '[]');
    storedCart.sort((a, b) => a.date.day - b.date.day);
    setCart(storedCart);
  }, []);

  useEffect(() => {
    (async () => {
      const sub = await getSubtotal(
        cart.map((item) => item.id)
      );
      setSubtotal(sub);
    })();
  }, [cart])

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setIsProcessing(true);
    try {
      const foodIds = cart.map((item) => item.id);
      const session = await createCheckoutSession(foodIds);
      
      if (session && session.url) {
        // Redirect to Stripe checkout
        window.location.href = session.url;
      } else {
        alert('Hiba történt a fizetés indításakor. Kérjük, próbálja újra!');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Hiba történt a fizetés indításakor. Kérjük, próbálja újra!');
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.page}>
      <Navbar 
        currentPage="cart"
        logoSection={
          <div className={styles.logoSection}>
            <div className={styles.logo}>
              <ShoppingCart />
            </div>
            <h1 className={styles.title}>Kosár és fizetés</h1>
          </div>
        }
      />
      <main className={styles.cartContainer}>
        <div className={styles.cartElements}>
          {cart.length > 0 ? (
            <>
              {cart.map((food) => (
                <CartElement
                  key={`${food.date.day}${food.date.week}`}
                  foodCart={food}
                  onDelete={() => {
                    const tmp = [...cart];
                    const index = tmp.findIndex(
                      (item) =>
                        item.id === food.id &&
                        item.date.year === food.date.year &&
                        item.date.week === food.date.week &&
                        item.date.day === food.date.day
                    );
                    if (index !== -1) {
                      tmp.splice(index, 1);
                      setCart(tmp);
                      localStorage.setItem('cart', JSON.stringify(tmp));
                      // Dispatch cart update event
                      window.dispatchEvent(new Event('cartUpdate'));
                    }
                  }}
                />
              ))}
              
              <div className={styles.cartSummary}>
                <p>Végösszeg: {new Intl.NumberFormat('hu-HU', {
                  style: 'currency',
                  currency: 'HUF'
                }).format(subtotal.subtotal)}</p>
                <p>Áfa (27%): {new Intl.NumberFormat('hu-HU', {
                  style: 'currency',
                  currency: 'HUF'
                }).format(subtotal.vat)}</p>
              </div>
            </>
          ) : (
            <p className={styles.emptyCart}>A kosár jelenleg üres.</p>
          )}
        </div>
        
        <div className={styles.cartButtons}>
          <button 
            onClick={handleCheckout}
            className={`${styles.btn} ${styles.btnBlue}`}
            disabled={cart.length === 0 || isProcessing}
          >
            {isProcessing ? 'Feldolgozás...' : 'Fizetés'}
          </button>
          <Link href="/" className={`${styles.btn} ${styles.btnBlue}`}>
            Vissza a menühöz
          </Link>
        </div>
      </main>
    </div>
  );
}
