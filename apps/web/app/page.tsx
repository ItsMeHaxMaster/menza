import Image from "next/image"; 
import styles from "./page.module.css";
import { Info, ShoppingCart, User, Utensils, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import InfoButton from "../components/InfoButton";
import api from "@/lib/api";

const dateRange = (start_date: Date) => {
  const monday = start_date;
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);

  if (parseInt(monday.toLocaleDateString('hu-HU', { day: '2-digit' })) > parseInt(friday.toLocaleDateString('hu-HU', { day: '2-digit' })))
    return monday.toLocaleDateString('hu-HU', { year: "numeric", month: 'short', day: '2-digit' }) + ' - ' + friday.toLocaleDateString('hu-HU', { month: "short", day: '2-digit' })

  return monday.toLocaleDateString('hu-HU', { year: "numeric", month: "short" }) +
  ' ' + monday.toLocaleDateString('hu-HU', { day: '2-digit' }) + ' - ' + friday.toLocaleDateString('hu-HU', { day: '2-digit' }) + '.';
}

export default async function Home() {
  const menu = await api.getMenu(new Date(1758547551000));

  const getMondaysFor2025 = (): Date[] => {
    const mondays: Date[] = [];
    const year = 2025;
    
    // Start from January 1, 2025
    const date = new Date(year, 0, 1);
    
    // Find the first Monday of the year
    while (date.getDay() !== 1) {
      date.setDate(date.getDate() + 1);
    }
    
    // Collect all Mondays for 2025
    while (date.getFullYear() === year) {
      const monday = new Date(date);
      monday.setHours(0, 0, 0, 0);
      mondays.push(monday);
      date.setDate(date.getDate() + 7);
    }
    
    return mondays;
  };

  const getCurrentMonday = (): Date => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    
    // Calculate days to subtract to get to Monday (1)
    // If today is Sunday (0), we need to go back 6 days
    // If today is Monday (1), we need to go back 0 days
    // If today is Tuesday (2), we need to go back 1 day, etc.
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    monday.setDate(today.getDate() - daysToSubtract);
    
    // Set time to midnight (00:00:00.000)
    monday.setHours(0, 0, 0, 0);
    
    return monday;
  };

  const mondaysIn2025 = getMondaysFor2025();
  const currentMonday = getCurrentMonday();

  console.log(menu, mondaysIn2025, currentMonday);

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
              <span className={styles.weekDate}>2025. szeptember 21-25.</span>
              <select defaultValue={currentMonday.getTime()}>
                {mondaysIn2025.map(monday => (
                  <option key={monday.getTime()} value={monday.getTime()}>{dateRange(monday)}</option>
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
  
            {menu.map((day) => (
              <div className={styles.day} key={day.id}>
                {day.foods.map((food) => (
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