'use client';

import styles from './OrderStatus.module.css';
import { Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getSubtotal } from '@/actions/actions';

// Add getWeek() to the Date prototype
declare global {
  interface Date {
    getWeek(): number;
  }
}

Date.prototype.getWeek = function () {
  const target = new Date(this.valueOf());
  const dayNr = (this.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
};

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
    allergens: unknown[];
  }[];
};

/**
 * Checks if there is a selected food item for a specific day in the selected week
 * @param cart - Current cart contents from localStorage
 * @param day - Day number to check (1-5 for Monday-Friday)
 * @param selectedWeek - The currently selected week number
 * @param selectedYear - The currently selected year
 * @returns boolean - True if there is a food item selected for the given day and week
 */
const isDaySelected = (
  cart: CartItem[],
  day: number,
  selectedWeek: number,
  selectedYear: number
) => {
  // Check for items in the selected week only
  return cart.some(
    (item) =>
      item.date.year === selectedYear &&
      item.date.week === selectedWeek &&
      item.date.day === day
  );
};

/**
 * OrderStatus Component
 * Displays the current status of the user's food selections for the selected week
 * Shows which days have selected meals and the total number of selected days
 * Updates in real-time when cart contents change or week selection changes
 * @param selectedWeek - The currently selected week number to display status for
 */
export default function OrderStatus({
  selectedWeek
}: {
  selectedWeek: number;
}) {
  // State to track current cart contents
  const [cart, setCart] = useState<CartItem[]>([]);
  // State to track number of days with selected meals
  const [selectedDays, setSelectedDays] = useState(0);
  // State to track subtotal
  const [subtotal, setSubtotal] = useState({
    subtotal: 0,
    vat: 0
  });
  // Current year for filtering
  const currentYear = new Date().getFullYear();

  /**
   * Updates the component state based on current cart contents and selected week
   * Reads cart data from localStorage and filters by selected week
   */
  const updateCartStatus = async () => {
    const storedCart = JSON.parse(
      localStorage.getItem('cart') || '[]'
    ) as CartItem[];

    // Filter cart items for the selected week only
    const filteredCart = storedCart.filter(
      (item) =>
        item.date.year === currentYear && item.date.week === selectedWeek
    );

    setCart(filteredCart);
    // Count unique days that have selections in the selected week
    setSelectedDays(new Set(filteredCart.map((item) => item.date.day)).size);

    // Calculate subtotal for selected week only
    if (filteredCart.length > 0) {
      const sub = await getSubtotal(filteredCart.map((item) => item.id));
      setSubtotal(sub);
    } else {
      setSubtotal({ subtotal: 0, vat: 0 });
    }
  };

  /**
   * Sets up event listeners for cart updates and week changes
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
  }, [selectedWeek]); // Re-run when selectedWeek changes

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
              className={`${styles.dayChip} ${isDaySelected(cart, day, selectedWeek, currentYear) ? styles.active : ''}`}
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
            }).format(subtotal.subtotal)}
          </span>
        </div>
      </div>
    </div>
  );
}
