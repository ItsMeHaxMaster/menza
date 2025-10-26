'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import '../globals.css';
import './page.modules.css';
import CartElement from '@/components/CartElement';
import { getSubtotal, createCheckoutSession } from '@/actions/actions';

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
    <main className="cart-container">
      <h1 className="cart-title">Kosár és fizetés</h1>

      <div className="cart-elements">
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
                  }
                }}
              />
            ))}
          </>
        ) : (
          <p className="empty-cart">A kosár jelenleg üres.</p>
        )}

        <div>
          <p>Végösszeg: {new Intl.NumberFormat('hu-HU', {
            style: 'currency',
            currency: 'HUF'
          }).format(subtotal.subtotal)}</p>
          <p>Áfa (27%): {new Intl.NumberFormat('hu-HU', {
            style: 'currency',
            currency: 'HUF'
          }).format(subtotal.vat)}</p>
        </div>
      </div>
      <div className="cart-buttons">
        <button 
          onClick={handleCheckout}
          className="btn btn-blue"
          disabled={cart.length === 0 || isProcessing}
        >
          {isProcessing ? 'Feldolgozás...' : 'Fizetés'}
        </button>
        <Link href="/" className="btn btn-blue">
          Vissza a menühöz
        </Link>
      </div>
    </main>
  );
}
