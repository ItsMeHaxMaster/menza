'use client';

import styles from './OrderStatus.module.css';
import { Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Type definition for items in the shopping cart
 * @property id - Unique identifier for the food item
 * @property date - Object containing year, week, and day for the meal
 */
type CartItem = {
  id: string;
  date: { year: number; week: number; day: number };
};

/**
 * Type definition for menu items from the API
 * @property id - Unique identifier for the menu item
 * @property year - Year of the menu
 * @property week - Week number in the year
 * @property day - Day of the week (1-5 for Monday-Friday)
 * @property foods - Array of food items available for this day
 */
type MenuItem = {
  id: string;
  year: number;
  week: number;
  day: number;
  foods: {
    id: string;
    name: string;
    price: number;
    description: string;
    pictureId: string;
    allergens: any[];
  }[];
};

/**
 * Checks if there is a selected food item for a specific day
 * @param cart - Current cart contents from localStorage
 * @param day - Day number to check (1-5 for Monday-Friday)
 * @returns boolean - True if there is a food item selected for the given day
 */
const isDaySelected = (cart: CartItem[], day: number) => {
  const currentWeek = new Date().getWeek();
  const currentYear = new Date().getFullYear();

  return cart.some(
    (item) =>
      item.date.year === currentYear &&
      item.date.week === currentWeek &&
      item.date.day === day
  );
};

/**
 * OrderStatus Component
 * Displays the current status of the user's food selections for the week
 * Shows which days have selected meals and the total number of selected days
 * Updates in real-time when cart contents change
 */
export default function OrderStatus() {
  // State to track current cart contents
  const [cart, setCart] = useState<CartItem[]>([]);
  // State to track number of days with selected meals
  const [selectedDays, setSelectedDays] = useState(0);

  /**
   * Updates the component state based on current cart contents
   * Reads cart data from localStorage and updates the UI accordingly
   */
  const updateCartStatus = () => {
    const storedCart = JSON.parse(
      localStorage.getItem('cart') || '[]'
    ) as CartItem[];
    setCart(storedCart);
    // Count unique days that have selections
    setSelectedDays(new Set(storedCart.map((item) => item.date.day)).size);
  };

  /**
   * Sets up event listeners for cart updates
   * Handles both direct updates and cross-tab synchronization
   */
  useEffect(() => {
    // Initial load of cart data
    updateCartStatus();

    /**
     * Event handler for cart updates
     * Called when AddButton components modify the cart
     */
    const handleCartUpdate = () => {
      updateCartStatus();
    };

    // Subscribe to cart update events
    window.addEventListener('cartUpdate', handleCartUpdate);

    // Cleanup: remove event listener when component unmounts
    return () => {
      window.removeEventListener('cartUpdate', handleCartUpdate);
    };
  }, []);

  return (
    <div className={styles.orderStatus}>
      {/* Status Summary Section */}
      <div className={styles.statusSummary}>
        {/* Calendar Icon */}
        <div className={styles.statusIcon}>
          <Calendar />
        </div>
        {/* Order Status Information */}
        <div className={styles.statusInfo}>
          <span className={styles.statusLabel}>Heti rendelés</span>
          <span className={styles.statusValue}>
            {selectedDays} nap kiválasztva
          </span>
        </div>
      </div>

      {/* Detailed Order Information */}
      <div className={styles.orderDetails}>
        {/* Day Selection Indicators */}
        <div className={styles.selectedDays}>
          {/* Generate chips for each day (Monday-Friday) */}
          {[1, 2, 3, 4, 5].map((day) => (
            <div
              key={day}
              className={`${styles.dayChip} ${isDaySelected(cart, day) ? styles.active : ''}`}
            >
              {/* Display day abbreviations (H, K, Sz, Cs, P) */}
              {['H', 'K', 'Sz', 'Cs', 'P'][day - 1]}
            </div>
          ))}
        </div>

        {/* Order Total Display */}
        <div className={styles.orderTotal}>
          <span>Összesen:</span>
          <span className={styles.totalAmount}>
            {new Intl.NumberFormat('hu-HU', {
              style: 'currency',
              currency: 'HUF'
            }).format(0)}{' '}
            {/* We'll implement price calculation later */}
          </span>
        </div>
      </div>
    </div>
  );
}
