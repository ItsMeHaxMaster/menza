'use client'; // Mark this component as a Client Component in Next.js

import { ShoppingBasket, Trash2 } from 'lucide-react'; // Import icons for the shopping basket and trash
import { useEffect, useState } from 'react'; // Import React hooks for state and side effects

/**
 * Custom event name for synchronizing cart updates across all AddButton components
 * This event is dispatched whenever the cart contents change
 */
const CART_UPDATE_EVENT = 'cartUpdate';

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
 * Helper function to compare two dates for equality
 * @param date1 - First date to compare
 * @param date2 - Second date to compare
 * @returns boolean - True if dates are the same (year, week, and day match)
 */
const isSameDate = (date1: CartItem['date'], date2: CartItem['date']) => {
  return (
    date1.year === date2.year &&
    date1.week === date2.week &&
    date1.day === date2.day
  );
};

/**
 * AddButton Component
 * Renders a button that toggles food items in/out of the cart for a specific day
 * Ensures only one food item can be selected per day
 *
 * @param props
 * @param props.className - Optional CSS class name for styling
 * @param props.foodId - Unique identifier for the food item
 * @param props.date - Object containing year, week, and day
 * @param props.onClick - Optional callback function triggered after cart updates
 */
export default function AddButton({
  className,
  foodId,
  date,
  onClick
}: {
  className?: string;
  foodId: string;
  date: { year: number; week: number; day: number };
  onClick?: any;
}) {
  // State to track if this food item is currently selected for its day
  const [isSelected, setIsSelected] = useState(false);

  /**
   * Updates the local state based on the current cart contents
   * Called when the component mounts and when cart updates occur
   */
  const updateState = () => {
    // Get current cart from localStorage
    const cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');

    // Check if this food item is selected for this day
    const selected = cart.some(
      (item) => item.id === foodId && isSameDate(item.date, date)
    );
    setIsSelected(selected);
  };

  useEffect(() => {
    // Set initial state when component mounts
    updateState();

    // Subscribe to cart update events
    window.addEventListener(CART_UPDATE_EVENT, updateState);

    // Cleanup: remove event listener when component unmounts
    return () => window.removeEventListener(CART_UPDATE_EVENT, updateState);
  }, [foodId, date]); // Re-run effect if foodId or date changes

  /**
   * Handles click events on the button
   * - If item is selected: removes it from cart
   * - If item is not selected: removes any existing item for that day and adds this item
   */
  const click = () => {
    // Get current cart state
    let cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');

    if (isSelected) {
      // If this item is selected, remove it from cart
      cart = cart.filter(
        (item) => !(item.id === foodId && isSameDate(item.date, date))
      );
    } else {
      // Remove any existing food item for this day
      cart = cart.filter((item) => !isSameDate(item.date, date));
      // Add the new food item
      cart.push({ id: foodId, date });
    }

    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Notify all AddButton components about the cart update
    window.dispatchEvent(new Event(CART_UPDATE_EVENT));

    // Call the optional onClick callback
    if (onClick) onClick();
  };

  return (
    <button className={className} data-action={isSelected} onClick={click}>
      {/* Show trash icon if selected, shopping basket if not */}
      {isSelected ? <Trash2 /> : <ShoppingBasket />}
    </button>
  );
}
