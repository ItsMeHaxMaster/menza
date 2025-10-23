'use client';

import { useEffect, useState } from 'react';
import styles from '../app/page.module.css';

export default function CartCounter() {
  const [count, setCount] = useState(0);

  const updateCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCount(cart.length);
  };

  useEffect(() => {
    updateCount();

    window.addEventListener('cartUpdate', updateCount);

    return () => {
      window.removeEventListener('cartUpdate', updateCount);
    };
  }, []);

  if (count === 0) return null;

  return (
    <div className={styles.cartBadge}>
      {count}
    </div>
  );
}