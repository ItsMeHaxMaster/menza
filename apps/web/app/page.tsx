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
            <div className={styles.menuOption}>
              <span className={styles.optionBadge}>1</span>
              <div className={styles.foodInfo}>
                <span className={styles.foodName}>Gulyás leves</span>
                <span className={styles.foodPrice}>1,200 Ft</span>
              </div>
              <div className={styles.actionButtons}>
                <InfoButton text="Összetevők..." />
                <button className={styles.addToCart}>+</button>
              </div>
            </div>
            <div>Kaja2</div>
            <div>Kaja3</div>
            <div>Kaja4</div>
            <div>Kaja5</div>
          </div>
          <div className={styles.option2}>
            <div className={styles.optionTitle}>Opció 2</div>
            <div>Kaja6</div>
            <div>Kaja7</div>
            <div>Kaja8</div>
            <div>Kaja9</div>
            <div>Kaja10</div>
          </div>
          <div className={styles.option3}>
            <div className={styles.optionTitle}>Opció 3</div>
            <div>Kaja11</div>
            <div>Kaja12</div>
            <div>Kaja13</div>
            <div>Kaja14</div>
            <div>Kaja15</div>
          </div>
        </div>
      </main>
    </div>
  );
}
