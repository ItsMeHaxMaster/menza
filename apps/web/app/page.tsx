'use client';

import styles from './page.module.css';
import { Utensils, UtensilsCrossed } from 'lucide-react';
import Image from 'next/image';
import InfoButton from '../components/InfoButton';
import { useEffect, useState } from 'react';
import AddButton from '@/components/AddButton';
import { getMenu } from '@/actions/actions';
import OrderStatus from '@/components/OrderStatus';
import Navbar from '@/components/Navbar';

/**
 * Extends the native Date object to calculate ISO week numbers
 * Used for organizing menu data by calendar week
 */
declare global {
  interface Date {
    getWeek(): number;
  }
}

/**
 * Type definitions for menu data structure
 */

interface Allergen {
  id: string;
  name: string;
  icon: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Food {
  id: string;
  name: string;
  description: string;
  price: number;
  pictureId: string;
  allergens: Allergen[];
}

interface MenuItem {
  id: string;
  year: number;
  week: number;
  day: number;
  foods: Food[];
}

/**
 * Calculates ISO 8601 week number for a given date
 * Week 1 is the week with the first Thursday of the year
 */
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
 * Generates formatted date range string for a given week
 * Returns Monday to Friday in Hungarian date format
 */
function getDateRangeForWeek(weekNumber: number, year: number = 2025): string {
  // Find the first Thursday of the year
  const jan4 = new Date(year, 0, 4);
  const firstThursday = new Date(jan4);
  firstThursday.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7) + 3);

  // Calculate the Monday of the target week
  const targetDate = new Date(firstThursday);
  targetDate.setDate(firstThursday.getDate() + (weekNumber - 1) * 7 - 3);

  const monday = targetDate;
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);

  if (
    parseInt(monday.toLocaleDateString('hu-HU', { day: '2-digit' })) >
    parseInt(friday.toLocaleDateString('hu-HU', { day: '2-digit' }))
  ) {
    return (
      monday.toLocaleDateString('hu-HU', {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      }) +
      ' - ' +
      friday.toLocaleDateString('hu-HU', { month: 'short', day: '2-digit' })
    );
  }

  return (
    monday.toLocaleDateString('hu-HU', { year: 'numeric', month: 'short' }) +
    ' ' +
    monday.toLocaleDateString('hu-HU', { day: '2-digit' }) +
    ' - ' +
    friday.toLocaleDateString('hu-HU', { day: '2-digit' }) +
    '.'
  );
}

/**
 * Generates array of available weeks for ordering
 * Returns current week + next 2 weeks (3 weeks total)
 */
const getWeeksForCurrentYear = (): number[] => {
  const weeks: number[] = [];
  const currentYear = new Date().getFullYear();
  const currentWeekNumber = new Date().getWeek();

  // Only show current week + next 2 weeks (3 weeks total)
  for (let i = 0; i < 3; i++) {
    const weekNumber = currentWeekNumber + i;

    // Handle year wrap (if week number exceeds weeks in year)
    const dec31 = new Date(currentYear, 11, 31);
    const weeksInYear = dec31.getWeek() === 1 ? 52 : 53;

    if (weekNumber <= weeksInYear) {
      weeks.push(weekNumber);
    } else {
      // Week in next year
      weeks.push(weekNumber - weeksInYear);
    }
  }

  return weeks;
};

export default function Home() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  const currentWeekNumber = new Date().getWeek();
  const nextWeekNumber = currentWeekNumber + 1;
  const weeksAvailable = getWeeksForCurrentYear();

  /**
   * Fetches and sorts menu data for a specific week
   */
  const updateMenu = async (week: number) => {
    setLoading(true);
    setSelectedWeek(week);
    const menuData = await getMenu(week, new Date().getFullYear());
    setMenu(
      menuData
        ? menuData.sort(
            (a: { day: number }, b: { day: number }) => a.day - b.day
          )
        : []
    );
    setLoading(false);
  };

  /**
   * Initialize with next week's menu by default
   */
  useEffect(() => {
    // Start with next week by default
    updateMenu(nextWeekNumber);
  }, [nextWeekNumber]);

  return (
    <div className={styles.page}>
      <Navbar
        currentPage="home"
        logoSection={
          <div className={styles.logoSection}>
            <div className={styles.logo}>
              <UtensilsCrossed />
            </div>
            <h1 className={styles.title}>Logiker Menza</h1>
          </div>
        }
      />

      <main className={styles.main}>
        <div className={styles.menuHeader}>
          <div className={styles.titleSection}>
            <h2 className={styles.menuTitle}>Heti Menü</h2>
            <div className={styles.weekInfo}>
              <select
                defaultValue={nextWeekNumber}
                onChange={(e) => {
                  updateMenu(parseInt((e.target as HTMLSelectElement).value));
                }}
              >
                {weeksAvailable.map((week: number) => (
                  <option key={week} value={week}>
                    {week}. hét - {getDateRangeForWeek(week)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Image
            className={styles.menuLogo}
            src="/imgs/Logiker_logo.svg"
            alt="logó"
            width={200}
            height={200}
            priority
          />
          <OrderStatus selectedWeek={selectedWeek || nextWeekNumber} />
        </div>
        <div className={styles.warning}>
          Csak a következő hétre lehet rendelni, naponta maximum 1 ételt.
          Előrendelés max. 2 héttel előre lehetséges.
        </div>

        <div className={styles.menuContainer}>
          <div className={styles.days}>
            <div>
              <Utensils />
            </div>
            <div>Hétfő</div>
            <div>Kedd</div>
            <div>Szerda</div>
            <div>Csütörtök</div>
            <div>Péntek</div>
          </div>

          <div className={styles.menuContent}>
            <div className={styles.optionTitles}>
              <div className={styles.optionTitle}>A</div>
              <div className={styles.optionTitle}>B</div>
              <div className={styles.optionTitle}>C</div>
            </div>

            {loading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, dayIndex) => (
                <div className={styles.day} key={`loading-${dayIndex}`}>
                  {Array.from({ length: 3 }).map((_, optionIndex) => (
                    <div
                      className={`${styles.menuCard} ${styles.skeleton}`}
                      key={`loading-${dayIndex}-${optionIndex}`}
                    >
                      <div className={styles.foodInfo}>
                        <span
                          className={`${styles.foodName} ${styles.skeletonText}`}
                        >
                          &nbsp;
                        </span>
                        <span
                          className={`${styles.foodPrice} ${styles.skeletonText}`}
                        >
                          &nbsp;
                        </span>
                      </div>
                      <div className={styles.actionButtons}>
                        <div className={styles.skeletonButton}>&nbsp;</div>
                        <div className={styles.skeletonButton}>&nbsp;</div>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            ) : menu.length === 0 ? (
              <div
                style={{
                  gridColumn: '2 / -1',
                  textAlign: 'center',
                  padding: '3rem'
                }}
              >
                <p style={{ fontSize: '1.2rem', opacity: 0.7 }}>
                  Nincs elérhető menü erre a hétre.
                </p>
              </div>
            ) : (
              menu.map((day: MenuItem) => {
                const dayNames = [
                  '',
                  'Hétfő',
                  'Kedd',
                  'Szerda',
                  'Csütörtök',
                  'Péntek'
                ];
                const options = ['A', 'B', 'C'];

                return (
                  <div
                    className={styles.day}
                    key={day.id}
                    data-day={dayNames[day.day]}
                  >
                    {day.foods.map((food: Food, index: number) => (
                      <div
                        className={styles.menuCard}
                        key={food.id}
                        data-option={options[index]}
                      >
                        <div className={styles.foodInfo}>
                          <span className={styles.foodName}>{food.name}</span>
                          <span className={styles.foodPrice}>
                            {new Intl.NumberFormat('hu-HU', {
                              style: 'currency',
                              currency: 'HUF'
                            }).format(food.price)}
                          </span>
                        </div>
                        <div className={styles.actionButtons}>
                          <InfoButton
                            text={food.description}
                            allergens={food.allergens}
                            foodName={food.name}
                            price={food.price}
                            foodId={food.id}
                            pictureId={food.pictureId}
                          />
                          <AddButton
                            className={styles.addToCart}
                            foodId={food.id}
                            date={{
                              year: day.year,
                              week: day.week,
                              day: day.day
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
