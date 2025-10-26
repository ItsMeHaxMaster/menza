'use client';

import { useState, useMemo } from 'react';
import styles from './InfoButton.module.css';
import {
  Info,
  AlertTriangle,
  Milk,
  Wheat,
  Fish,
  Egg,
  Nut,
  Beef,
  Apple,
  Leaf,
  LucideIcon,
  X,
  ChefHat
} from 'lucide-react';
import Image from 'next/image';
import Showdown from 'showdown';

interface Allergen {
  id: string;
  name: string;
  icon: string;
  createdAt?: string;
  updatedAt?: string;
}

// Map icon names to Lucide icons
const iconMap: Record<string, LucideIcon> = {
  milk: Milk,
  wheat: Wheat,
  fish: Fish,
  egg: Egg,
  nut: Nut,
  nuts: Nut,
  beef: Beef,
  meat: Beef,
  apple: Apple,
  fruit: Apple,
  leaf: Leaf,
  gluten: Wheat,
  dairy: Milk
};

export default function InfoButton({
  text,
  allergens,
  foodName,
  price,
  pictureId
}: {
  text: string;
  allergens?: Allergen[];
  foodName: string;
  price: number;
  pictureId?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Convert markdown to HTML using showdown
  const htmlContent = useMemo(() => {
    const converter = new Showdown.Converter();
    return converter.makeHtml(text);
  }, [text]);

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName.toLowerCase()] || AlertTriangle;
    return IconComponent;
  };

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className={styles.button}>
        <Info />
      </button>

      <div data-open={isOpen} className={styles.container}>
        <div className={styles.overlay} onClick={() => setIsOpen(false)} />
        <div className={styles.info}>
          <button
            className={styles.closeButton}
            onClick={() => setIsOpen(false)}
          >
            <X size={24} />
          </button>

          <div className={styles.heroSection}>
            {pictureId && (
              <div className={styles.imageContainer}>
                <Image
                  src={`https://cdn-canteen.kenderesi.hu/images/${pictureId}.webp`}
                  alt={foodName}
                  width={400}
                  height={300}
                  className={styles.foodImage}
                />
              </div>
            )}

            <div className={styles.header}>
              <h1>{foodName}</h1>
              <span className={styles.price}>
                {new Intl.NumberFormat('hu-HU', {
                  style: 'currency',
                  currency: 'HUF'
                }).format(price)}
              </span>
            </div>
          </div>

          {allergens && allergens.length > 0 && (
            <div className={styles.section} data-color="red">
              <div className={styles.sectionHeader} data-color="red">
                <AlertTriangle size={20} />
                <h2>Allergének</h2>
              </div>
              <ul className={styles.allergenList}>
                {allergens.map((allergen) => {
                  const IconComponent = getIcon(allergen.icon);
                  return (
                    <li key={allergen.id} className={styles.allergenItem}>
                      <IconComponent
                        size={16}
                        className={styles.allergenIcon}
                      />
                      {allergen.name}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className={styles.section} data-color="blue">
            <div className={styles.sectionHeader} data-color="blue">
              <ChefHat size={20} />
              <h2>Leírás</h2>
            </div>
            <div
              className={styles.description}
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
