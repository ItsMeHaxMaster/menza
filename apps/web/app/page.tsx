import styles from './page.module.css';
import { ShoppingCart, User, Utensils, UtensilsCrossed } from 'lucide-react';
import Link from 'next/link';
import InfoButton from '../components/InfoButton';
import api from '@/lib/api';
import { useState } from 'react';
import AddButton from '@/components/AddButton';

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

export default async function Home() {
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

  const weeksIn2025 = getWeeksForCurrentYear();
  const currentWeekNumber = new Date().getWeek();

  const menu = await api.getMenu(currentWeekNumber, new Date().getFullYear());
  const sortedMenu = menu
    ? menu.sort((a: { day: number }, b: { day: number }) => a.day - b.day)
    : [];

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
            <div className={styles.cartBadge}>3</div>
          </Link>
        </nav>
      </header>

      <main className={styles.main}>
        <div className={styles.menuHeader}>
          <div className={styles.titleSection}>
            <h2 className={styles.menuTitle}>Heti Menü</h2>
            <div className={styles.weekInfo}>
              <select defaultValue={currentWeekNumber}>
                {weeksIn2025.map((week) => (
                  <option key={week} value={week}>
                    {week}. hét - {getDateRangeForWeek(week)}
                  </option>
                ))}
              </select>
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

            {sortedMenu.map((day: MenuItem) => {
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
                        <InfoButton text={food.description} />
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
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
