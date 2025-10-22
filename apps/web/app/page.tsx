"use client";
import Image from "next/image";
import styles from "./page.module.css";
import {
  Info,
  ShoppingCart,
  User,
  Utensils,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import InfoButton from "../components/InfoButton";

export default function Home() {
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

          <div className={styles.menuStats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>15</span>
              <span className={styles.statLabel}>Étel</span>
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
