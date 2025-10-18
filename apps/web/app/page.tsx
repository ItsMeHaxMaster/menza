import styles from "./page.module.css";
import { ShoppingCart, User, Utensils, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import InfoButton from "../components/InfoButton";
import api from "@/lib/api";

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

// Helper function to get ISO week number
function getWeekNumber(date: Date): number {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}

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

  if (parseInt(monday.toLocaleDateString('hu-HU', { day: '2-digit' })) > parseInt(friday.toLocaleDateString('hu-HU', { day: '2-digit' })))
    return monday.toLocaleDateString('hu-HU', { year: "numeric", month: 'short', day: '2-digit' }) + ' - ' + friday.toLocaleDateString('hu-HU', { month: "short", day: '2-digit' })

  return monday.toLocaleDateString('hu-HU', { year: "numeric", month: "short" }) +
  ' ' + monday.toLocaleDateString('hu-HU', { day: '2-digit' }) + ' - ' + friday.toLocaleDateString('hu-HU', { day: '2-digit' }) + '.';
}

export default async function Home() {
  // Get all week numbers for 2025
  const getWeeksFor2025 = (): number[] => {
    const weeks: number[] = [];
    
    // ISO 8601 week date system: 2025 has 52 weeks
    for (let week = 1; week <= 52; week++) {
      weeks.push(week);
    }
    
    return weeks;
  };

  const getCurrentWeekNumber = (): number => {
    const today = new Date();
    return getWeekNumber(today);
  };

  const weeksIn2025 = getWeeksFor2025();
  const currentWeekNumber = getCurrentWeekNumber();
  const currentYear = 2025;

  const menu = await api.getMenu(currentWeekNumber, currentYear);

  console.log(menu, weeksIn2025, currentWeekNumber);

  // Sort menu by day number and ensure it's an array
  const sortedMenu = menu ? menu.sort((a: { day: number }, b: { day: number }) => a.day - b.day) : [];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logoSection}>
          <div className={styles.logo}><UtensilsCrossed /></div>
          <h1 className={styles.title}>Logiker Menza</h1>
        </div>
        <nav className={styles.navbar}>
          <Link className={styles.navButton} href="./profile">
            <User size={24}/>
            <span>Profil</span>
          </Link>
          <Link className={styles.navButton} href="./cart">
            <ShoppingCart size={24}/>
            <span>Kosár</span>
            <div className={styles.cartBadge}>3</div>
          </Link>
        </nav>
      </header>
      
      <main className={styles.main}>
        <div className={styles.menuHeader}>
          <div className={styles.titleSection}>
            <h2 className={styles.menuTitle}>Heti menü</h2>
            <div className={styles.weekInfo}>
              <span className={styles.weekDate}>{currentWeekNumber}. hét</span>
              <select defaultValue={currentWeekNumber}>
                {weeksIn2025.map(week => (
                  <option key={week} value={week}>{week}. hét - {getDateRangeForWeek(week)}</option>
                ))}
              </select>
              <div className={styles.statusBadge}>Friss</div>
            </div>
          </div>
          
          <div className={styles.menuStats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>15</span>
              <span className={styles.statLabel}>Étel</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>3</span>
              <span className={styles.statLabel}>Opció</span>
            </div>
          </div>
        </div>

        <div className={styles.menuContainer}>
          <div className={styles.days}>
            <div><Utensils /></div>
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
  
            {sortedMenu.map((day: MenuItem) => (
              <div className={styles.day} key={day.id}>
                {day.foods.map((food: Food) => (
                  <div className={styles.menuCard} key={food.id}>
                    <div className={styles.foodInfo}>
                      <span className={styles.foodName}>{food.name}</span>
                      <span className={styles.foodPrice}>
                        {new Intl.NumberFormat("hu-HU", { style: "currency", currency: "HUF" }).format(food.price)}
                      </span>
                    </div>
                    <div className={styles.actionButtons}>
                      <InfoButton text={food.description} />
                      <input type="radio" name={day.id} style={{ display: 'none' }} />
                      <button className={styles.addToCart}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}