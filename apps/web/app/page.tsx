'use client';
import Image from "next/image";
import styles from "./page.module.css";
import { Info, ShoppingCart, User, Utensils } from "lucide-react";
import InfoButton from "../components/InfoButton";

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logoSection}>
          <div className={styles.logo}>🍽️</div>
          <h1 className={styles.title}>Logiker Menza</h1>
        </div>
        <nav className={styles.navbar}>
          <button className={styles.navButton}>
            <User size={24}/>
            <span>Profil</span>
          </button>
          <button className={styles.navButton}>
            <ShoppingCart size={24}/>
            <span>Kosár</span>
            <div className={styles.cartBadge}>3</div>
          </button>
        </nav>
      </header>
      
      <main className={styles.main}>
        <div className={styles.menuHeader}>
          <div className={styles.titleSection}>
            <h2 className={styles.menuTitle}>Heti menü</h2>
            <div className={styles.weekInfo}>
              <span className={styles.weekDate}>2025. szeptember 21-25.</span>
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
            <div className={styles.option1}>
              <div className={styles.optionTitle}>A</div>
              <div className={styles.menuCard}>
                <div className={styles.foodInfo}>
                  <span className={styles.foodName}>Gulyás leves</span>
                  <span className={styles.foodPrice}>1,200 Ft</span>
                </div>
                <div className={styles.actionButtons}>
                  <InfoButton text="Összetevők..." />
                  <button className={styles.addToCart}>+</button>
                </div>
              </div>
              <div className={styles.menuCard}>
                <div className={styles.foodInfo}>
                  <span className={styles.foodName}>Kaja2</span>
                  <span className={styles.foodPrice}>1,200 Ft</span>
                </div>
                <div className={styles.actionButtons}>
                  <InfoButton text="Összetevők..." />
                  <button className={styles.addToCart}>+</button>
                </div>
              </div>
              <div className={styles.menuCard}>
                <div className={styles.foodInfo}>
                  <span className={styles.foodName}>Kaja3</span>
                  <span className={styles.foodPrice}>1,200 Ft</span>
                </div>
                <div className={styles.actionButtons}>
                  <InfoButton text="Összetevők..." />
                  <button className={styles.addToCart}>+</button>
                </div>
              </div>
              <div className={styles.menuCard}>
                <div className={styles.foodInfo}>
                  <span className={styles.foodName}>Kaja4</span>
                  <span className={styles.foodPrice}>1,200 Ft</span>
                </div>
                <div className={styles.actionButtons}>
                  <InfoButton text="Összetevők..." />
                  <button className={styles.addToCart}>+</button>
                </div>
              </div>
              <div className={styles.menuCard}>
                <div className={styles.foodInfo}>
                  <span className={styles.foodName}>Kaja5</span>
                  <span className={styles.foodPrice}>1,200 Ft</span>
                </div>
                <div className={styles.actionButtons}>
                  <InfoButton text="Összetevők..." />
                  <button className={styles.addToCart}>+</button>
                </div>
              </div>
            </div>

            <div className={styles.option2}>
              <div className={styles.optionTitle}>B</div>
              <div className={styles.menuCard}>
                <div className={styles.foodInfo}>
                  <span className={styles.foodName}>Kaja6</span>
                  <span className={styles.foodPrice}>1,200 Ft</span>
                </div>
                <div className={styles.actionButtons}>
                  <InfoButton text="Összetevők..." />
                  <button className={styles.addToCart}>+</button>
                </div>
              </div>
              <div className={styles.menuCard}>
                <div className={styles.foodInfo}>
                  <span className={styles.foodName}>Kaja7</span>
                  <span className={styles.foodPrice}>1,200 Ft</span>
                </div>
                <div className={styles.actionButtons}>
                  <InfoButton text="Összetevők..." />
                  <button className={styles.addToCart}>+</button>
                </div>
              </div>
              <div className={styles.menuCard}>
                <div className={styles.foodInfo}>
                  <span className={styles.foodName}>Kaja8</span>
                  <span className={styles.foodPrice}>1,200 Ft</span>
                </div>
                <div className={styles.actionButtons}>
                  <InfoButton text="Összetevők..." />
                  <button className={styles.addToCart}>+</button>
                </div>
              </div>
              <div className={styles.menuCard}>
                <div className={styles.foodInfo}>
                  <span className={styles.foodName}>Kaja9</span>
                  <span className={styles.foodPrice}>1,200 Ft</span>
                </div>
                <div className={styles.actionButtons}>
                  <InfoButton text="Összetevők..." />
                  <button className={styles.addToCart}>+</button>
                </div>
              </div>
              <div className={styles.menuCard}>
                <div className={styles.foodInfo}>
                  <span className={styles.foodName}>Kaja10</span>
                  <span className={styles.foodPrice}>1,200 Ft</span>
                </div>
                <div className={styles.actionButtons}>
                  <InfoButton text="Összetevők..." />
                  <button className={styles.addToCart}>+</button>
                </div>
              </div>
            </div>

            <div className={styles.option3}>
              <div className={styles.optionTitle}>C</div>
              <div className={styles.menuCard}>
                <div className={styles.foodInfo}>
                  <span className={styles.foodName}>Kaja11</span>
                  <span className={styles.foodPrice}>1,200 Ft</span>
                </div>
                <div className={styles.actionButtons}>
                  <InfoButton text="Összetevők..." />
                  <button className={styles.addToCart}>+</button>
                </div>
              </div>
              <div className={styles.menuCard}>
                <div className={styles.foodInfo}>
                  <span className={styles.foodName}>Kaja12</span>
                  <span className={styles.foodPrice}>1,200 Ft</span>
                </div>
                <div className={styles.actionButtons}>
                  <InfoButton text="Összetevők..." />
                  <button className={styles.addToCart}>+</button>
                </div>
              </div>
              <div className={styles.menuCard}>
                <div className={styles.foodInfo}>
                  <span className={styles.foodName}>Kaja13</span>
                  <span className={styles.foodPrice}>1,200 Ft</span>
                </div>
                <div className={styles.actionButtons}>
                  <InfoButton text="Összetevők..." />
                  <button className={styles.addToCart}>+</button>
                </div>
              </div>
              <div className={styles.menuCard}>
                <div className={styles.foodInfo}>
                  <span className={styles.foodName}>Kaja14</span>
                  <span className={styles.foodPrice}>1,200 Ft</span>
                </div>
                <div className={styles.actionButtons}>
                  <InfoButton text="Összetevők..." />
                  <button className={styles.addToCart}>+</button>
                </div>
              </div>
              <div className={styles.menuCard}>
                <div className={styles.foodInfo}>
                  <span className={styles.foodName}>Kaja15</span>
                  <span className={styles.foodPrice}>1,200 Ft</span>
                </div>
                <div className={styles.actionButtons}>
                  <InfoButton text="Összetevők..." />
                  <button className={styles.addToCart}>+</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}