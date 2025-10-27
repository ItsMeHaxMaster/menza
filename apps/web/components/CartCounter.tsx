'use client';

import { useEffect, useState } from 'react';
import styles from '../app/page.module.css';

/**
 * CartCounter Component
 * Displays a badge showing the number of items in the shopping cart.
 * Updates in real-time when cart contents change and automatically
 * hides itself when the cart is empty.
 */
export default function CartCounter() {
  // State to track the number of items in the cart
  const [count, setCount] = useState(0);

  /**
   * Updates the counter based on current cart contents in localStorage
   */
  const updateCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCount(cart.length);
  };

  /**
   * Subscribes to cart update events to keep the counter synchronized
   * across all instances and browser tabs
   */
  useEffect(() => {
    // Initial load of cart data
    updateCount(); /**
     * Event handler for cart updates
     * Called when AddButton components modify the cart
     */
    window.addEventListener('cartUpdate', updateCount);

    // Cleanup: remove event listener when component unmounts
    return () => {
      window.removeEventListener('cartUpdate', updateCount);
    };
  }, []);

  // Hide the counter when cart is empty
  if (count === 0) return null;

  // Render the badge with current count
  return <div className={styles.cartBadge}>{count}</div>;
}
