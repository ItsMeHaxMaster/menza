'use client';

import styles from './CartElement.module.css';

import { useEffect, useState } from 'react';
import { getFood } from '@/actions/actions';
import InfoButton from './InfoButton';
import AddButton from './AddButton';

/**
 * Food item structure returned from the API
 */
interface Food {
  id: string;
  name: string;
  description: string;
  price: number;
  pictureId: string;
  allergens: Array<{
    id: string;
    name: string;
    icon: string;
  }>;
}

/**
 * Props for CartElement component
 */
interface CartElementProps {
  foodCart: {
    id: string;
    date: {
      year: number;
      week: number;
      day: number;
    };
  };
  onDelete: () => void;
}

/**
 * CartElement Component
 * Displays a single food item in the shopping cart with its details,
 * including the scheduled date, price, and action buttons.
 * Fetches food data from the API and handles loading/error states.
 */
export default function CartElement({ foodCart, onDelete }: CartElementProps) {
  const [food, setFood] = useState<Food | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Converts day number to Hungarian day name
   */
  const nap = (day: number) => {
    switch (day) {
      case 1:
        return 'Hétfő';
      case 2:
        return 'Kedd';
      case 3:
        return 'Szerda';
      case 4:
        return 'Csütörtök';
      case 5:
        return 'Péntek';
      case 6:
        return 'Szombat';
    }
  };

  /**
   * Fetches food data when component mounts or foodCart.id changes
   * Includes cleanup to prevent state updates on unmounted components
   */
  useEffect(() => {
    let mounted = true;

    const fetchFood = async () => {
      try {
        setLoading(true);
        setError(null);
        const foodData = await getFood(foodCart.id);

        if (!mounted) return;

        if (!foodData) {
          setError('Nem sikerült betölteni az étel adatait');
          return;
        }

        setFood(foodData);
      } catch (err) {
        if (!mounted) return;
        setError('Hiba történt az adatok betöltése közben');
        console.error('Error fetching food:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchFood();

    return () => {
      mounted = false;
    };
  }, [foodCart.id]);

  // Loading state with skeleton animation
  if (loading) {
    return (
      <div className={styles.foodItem}>
        <div className={styles.skeleton}>
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLine} />
        </div>
      </div>
    );
  }

  // Error state with remove button
  if (error || !food) {
    return (
      <div className={styles.foodItem}>
        <div className={styles.error}>{error || 'Nem található az étel'}</div>
        <button onClick={onDelete} className={styles.removeButton}>
          Eltávolítás a kosárból
        </button>
      </div>
    );
  }

  return (
    <div className={styles.foodItem}>
      <div
        style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}
      >
        <span className={styles.food}>{food.name}</span>
        <span>
          {foodCart.date.week}. hét, {nap(foodCart.date.day)}
        </span>
      </div>

      <span className={styles.foodPrice}>
        {new Intl.NumberFormat('hu-HU', {
          style: 'currency',
          currency: 'HUF'
        }).format(food.price)}
      </span>

      <div className={styles.buttons}>
        <InfoButton
          text={food.description}
          allergens={food.allergens}
          foodName={food.name}
          price={food.price}
          pictureId={food.pictureId}
        />
        <AddButton
          className={styles.addToCart}
          foodId={food.id}
          onClick={onDelete}
          date={{
            year: foodCart.date.year,
            week: foodCart.date.week,
            day: foodCart.date.day
          }}
        />
      </div>
    </div>
  );
}
