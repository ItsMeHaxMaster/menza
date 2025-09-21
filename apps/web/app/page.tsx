'use client';
import Image from "next/image";
import styles from "./page.module.css";
import { Info, ShoppingCart, User, Utensils } from "lucide-react";
import InfoButton from "../components/InfoButton";

export default function Home() {
  return (
    <div className={styles.page}>
      <header>
        <h1>Logiker Menza</h1>
        <button className={"navButton"}><User size={40}/></button>
        <button className={"navButton"} style={{ marginLeft: '1rem'}}><ShoppingCart size={40}/></button>
      </header>
      <main className={styles.main}>
        <div className={styles.menu}>
          <h2>Heti menü</h2>
          <div className={styles.days}>
            <div><Utensils /></div>
            <div>Hétfő</div>
            <div>Kedd</div>
            <div>Szerda</div>
            <div>Csütörtök</div>
            <div>Péntek</div>
          </div>
          <div className={styles.option1}>
            <div className={styles.optionTitle}>Opció 1</div>
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
            <div className={styles.optionTitle}>Opció 2</div>
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
            <div className={styles.optionTitle}>Opció 3</div>
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
      </main>
    </div>
  );
}