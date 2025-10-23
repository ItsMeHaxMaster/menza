'use client';

import styles from './page.module.css';
import {
  ShoppingCart,
  User,
  Utensils,
  UtensilsCrossed,
  Calendar,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import InfoButton from '../components/InfoButton';
import api from '@/lib/api';
import { useEffect, useState } from 'react';
import AddButton from '@/components/AddButton';
import CartCounter from '@/components/CartCounter';
import { getMenu } from '@/actions/actions';

declare global {
  interface Date {
    getWeek(): number;
  }
}

// Types for menu data
interface Food {
  id: string;
  name: string;
  description: string;
  price: number;
  pictureId: string;
  allergens: string[];
}

interface MenuItem {
  id: string;
  year: number;
  week: number;
  day: number;
  foods: Food[];
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

// Get date range for a week number
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
  )
    return (
      monday.toLocaleDateString('hu-HU', {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      }) +
      ' - ' +
      friday.toLocaleDateString('hu-HU', { month: 'short', day: '2-digit' })
    );

  return (
    monday.toLocaleDateString('hu-HU', { year: 'numeric', month: 'short' }) +
    ' ' +
    monday.toLocaleDateString('hu-HU', { day: '2-digit' }) +
    ' - ' +
    friday.toLocaleDateString('hu-HU', { day: '2-digit' }) +
    '.'
  );
}

const getWeeksForCurrentYear = (): number[] => {
    const weeks: number[] = [];
    const currentYear = new Date().getFullYear();

    const dec31 = new Date(currentYear, 11, 31);
    const weeksInYear = dec31.getWeek() === 1 ? 52 : 53;

    for (let week = 1; week <= weeksInYear; week++) {
      weeks.push(week);
    }

    return weeks;
  };

export default function Home() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  const weeksIn2025 = getWeeksForCurrentYear();
  const currentWeekNumber = new Date().getWeek();

  const updateMenu = async (week: number) => {
    setLoading(true);
    const menuData = await getMenu(week, new Date().getFullYear());
    setMenu(
      menuData
        ? menuData.sort((a: { day: number }, b: { day: number }) => a.day - b.day)
        : []
    );
    setLoading(false);
  }

  useEffect(() => {
    updateMenu(currentWeekNumber);
  }, [currentWeekNumber]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logoSection}>
          <div className={styles.logo}>
            <UtensilsCrossed />
          </div>
          <h1 className={styles.title}>Logiker Menza</h1>
        </div>
        <nav className={styles.navbar}>
          <Link className={styles.navButton} href="./profile">
            <User size={24} />
            <span>Profil</span>
          </Link>
          <Link className={styles.navButton} href="./cart">
            <ShoppingCart size={24} />
            <span>Kosár</span>
            <CartCounter />
          </Link>
        </nav>
      </header>

      <main className={styles.main}>
        <div className={styles.menuHeader}>
          <div className={styles.titleSection}>
            <h2 className={styles.menuTitle}>Heti Menü</h2>
            <div className={styles.weekInfo}>
              <select defaultValue={currentWeekNumber} onChange={(e) => {
                updateMenu(parseInt((e.target as HTMLSelectElement).value))
              }}>
                {weeksIn2025.map((week) => (
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
          <div className={styles.orderStatus}>
            <div className={styles.statusSummary}>
              <div className={styles.statusIcon}>
                <Calendar />
              </div>
              <div className={styles.statusInfo}>
                <span className={styles.statusLabel}>Heti rendelés</span>
                <span className={styles.statusValue}>3 nap kiválasztva</span>
              </div>
            </div>
            <div className={styles.orderDetails}>
              <div className={styles.selectedDays}>
                <div className={styles.dayChip}>H</div>
                <div className={styles.dayChip}>K</div>
                <div className={`${styles.dayChip} ${styles.active}`}>Sz</div>
                <div className={`${styles.dayChip} ${styles.active}`}>Cs</div>
                <div className={`${styles.dayChip} ${styles.active}`}>P</div>
              </div>
              <div className={styles.orderTotal}>
                <span>Összesen:</span>
                <span className={styles.totalAmount}>3900 Ft</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.warning}>
          Naponta csak 1 ételt lehet választani.
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
                        <span className={`${styles.foodName} ${styles.skeletonText}`}>
                          &nbsp;
                        </span>
                        <span className={`${styles.foodPrice} ${styles.skeletonText}`}>
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
              <div style={{ gridColumn: '2 / -1', textAlign: 'center', padding: '3rem' }}>
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
