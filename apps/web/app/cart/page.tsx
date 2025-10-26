'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ShoppingCart, UtensilsCrossed, User } from 'lucide-react';

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
      const sub = await getSubtotal(cart.map((item) => item.id));
      setSubtotal(sub);
    })();
  }, [cart]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setIsProcessing(true);
    try {
      // Extract year, week, and unique days from cart
      const firstItem = cart[0].date;
      const year = firstItem.year;
      const week = firstItem.week;
      const days = [...new Set(cart.map((item) => item.date.day))];

      // Validate all items are from the same year and week
      const allSameWeek = cart.every(
        (item) => item.date.year === year && item.date.week === week
      );

      if (!allSameWeek) {
        alert('Csak egy hét ételeit lehet egyszerre megrendelni!');
        setIsProcessing(false);
        return;
      }

      const foodIds = cart.map((item) => item.id);
      const session = await createCheckoutSession(foodIds, year, week, days);

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
              <ShoppingCart size={32} />
            </div>
            <h1 className={styles.title}>Kosár és fizetés</h1>
          </div>
        }
      />

      <main className={styles.main}>
        <div className={styles.cartContainer}>
          <div className={styles.cartContent}>
            {cart.length > 0 ? (
              <>
                <div className={styles.cartItems}>
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
                        }
                      }}
                    />
                  ))}
                </div>
                <div className={styles.cartSummary}>
                  <h3>Összesítés</h3>
                  <div className={styles.summaryDetails}>
                    <div className={styles.summaryRow}>
                      <span>Részösszeg:</span>
                      <span className={styles.amount}>
                        {new Intl.NumberFormat('hu-HU', {
                          style: 'currency',
                          currency: 'HUF'
                        }).format(subtotal.subtotal)}
                      </span>
                    </div>
                    <div className={styles.summaryRow}>
                      <span>Áfa (27%):</span>
                      <span className={styles.amount}>
                        {new Intl.NumberFormat('hu-HU', {
                          style: 'currency',
                          currency: 'HUF'
                        }).format(subtotal.vat)}
                      </span>
                    </div>
                    <div className={`${styles.summaryRow} ${styles.total}`}>
                      <span>Végösszeg:</span>
                      <span className={styles.amount}>
                        {new Intl.NumberFormat('hu-HU', {
                          style: 'currency',
                          currency: 'HUF'
                        }).format(subtotal.subtotal)}
                      </span>
                    </div>
                  </div>
                  <div className={styles.cartButtons}>
                    <button
                      onClick={handleCheckout}
                      className={styles.checkoutButton}
                      disabled={cart.length === 0 || isProcessing}
                    >
                      {isProcessing ? 'Feldolgozás...' : 'Fizetés'}
                    </button>
                    <Link href="/" className={styles.backButton}>
                      Vissza a menühöz
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.emptyCart}>
                <ShoppingCart size={64} />
                <p>A kosár jelenleg üres</p>
                <Link href="/" className={styles.backButton}>
                  Vissza a menühöz
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
