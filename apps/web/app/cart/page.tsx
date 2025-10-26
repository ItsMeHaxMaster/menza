'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ShoppingCart, UtensilsCrossed, User } from 'lucide-react';

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
      const sub = await getSubtotal(cart.map((item) => item.id));
      setSubtotal(sub);
    })();
  }, [cart]);

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
    <div className="page">
      <header className="header">
        <div className="logoSection">
          <div className="logo">
            <ShoppingCart size={32} />
          </div>
          <h1 className="title">Kosár és fizetés</h1>
        </div>
        <nav className="navbar">
          <Link className="navButton" href="/">
            <UtensilsCrossed size={24} />
            <span>Menü</span>
          </Link>
          <Link className="navButton" href="/profile">
            <User size={24} />
            <span>Profilom</span>
          </Link>
        </nav>
      </header>

      <main className="main">
        <div className="cartContainer">
          <div className="cartContent">
            {cart.length > 0 ? (
              <>
                <div className="cartItems">
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
                <div className="cartSummary">
                  <h3>Összesítés</h3>
                  <div className="summaryDetails">
                    <div className="summaryRow">
                      <span>Részösszeg:</span>
                      <span className="amount">
                        {new Intl.NumberFormat('hu-HU', {
                          style: 'currency',
                          currency: 'HUF'
                        }).format(subtotal.subtotal)}
                      </span>
                    </div>
                    <div className="summaryRow">
                      <span>Áfa (27%):</span>
                      <span className="amount">
                        {new Intl.NumberFormat('hu-HU', {
                          style: 'currency',
                          currency: 'HUF'
                        }).format(subtotal.vat)}
                      </span>
                    </div>
                    <div className="summaryRow total">
                      <span>Végösszeg:</span>
                      <span className="amount">
                        {new Intl.NumberFormat('hu-HU', {
                          style: 'currency',
                          currency: 'HUF'
                        }).format(subtotal.subtotal + subtotal.vat)}
                      </span>
                    </div>
                  </div>
                  <div className="cartButtons">
                    <button
                      onClick={handleCheckout}
                      className="checkoutButton"
                      disabled={cart.length === 0 || isProcessing}
                    >
                      {isProcessing ? 'Feldolgozás...' : 'Fizetés'}
                    </button>
                    <Link href="/" className="backButton">
                      Vissza a menühöz
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <div className="emptyCart">
                <ShoppingCart size={64} />
                <p>A kosár jelenleg üres</p>
                <Link href="/" className="backButton">
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
