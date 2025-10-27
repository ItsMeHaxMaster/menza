'use client';

import styles from './CartElement.module.css';

import { useEffect, useState } from 'react';
import { getFood } from '@/actions/actions';
import InfoButton from './InfoButton';
import AddButton from './AddButton';

interface Allergen {
  id: string;
  name: string;
  icon: string;
}

interface Food {
  id: string;
  name: string;
  description: string;
  price: number;
  pictureId: string;
  allergens: Allergen[];
}

export default function CartElement({
  foodCart,
  onDelete
}: {
  foodCart: any;
  onDelete: any;
}) {
  const [food, setFood] = useState<Food | null>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    (async () => {
      const foodData = await getFood(foodCart.id);
      setFood(foodData);
      setLoading(false);
    })();
  }, [foodCart]);

  if (loading || !food) return <></>;
  return (
    <div>
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
          />{' '}
          <AddButton
            className={styles.addToCart}
            foodId={food.id}
            onClick={() => {
              onDelete();
            }}
            date={{
              year: foodCart.date.year,
              week: foodCart.date.week,
              day: foodCart.date.day
            }}
          />
        </div>
      </div>
    </div>
  );
}
