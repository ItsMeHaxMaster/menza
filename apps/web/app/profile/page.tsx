import Link from "next/link";
import styles from "./page.module.css";
import { UtensilsCrossed, ShoppingCart, User } from "lucide-react";
import api from "@/lib/api";
import { deleteSession } from "../actions";

export default async function Profile() {
  const profile = await api.getUser();

  if (!profile) {
    return (<p>Hiba!</p>);
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logoSection}>
          <div className={styles.logo}><User /></div>
          <h1 className={styles.title}>Profilom</h1>
        </div>
        <nav className={styles.navbar}>
          <Link className={styles.navButton} href="/">
            <UtensilsCrossed size={24} />
            <span>Menü</span>
          </Link>
          <Link className={styles.navButton} href="/cart">
            <ShoppingCart size={24} />
            <span>Kosár</span>
            <div className={styles.cartBadge}>3</div>
          </Link>
        </nav>
      </header>

      <main className={styles.main}>
        <div className={styles.profileContainer}>
          <div className={styles.profileHeader}>
            <div className={styles.avatar}>
              {profile.name
                .split(" ")
                .map((n:string) => n[0])
                .join("")
                .toUpperCase()}
            </div>
            <div>
              <h2 className={styles.userName}>{profile.name}</h2>
              <p className={styles.userEmail}>{profile.email}</p>
            </div>
          </div>

          <div className={styles.profileDetails}>
            <h3>Felhasználói adatok</h3>
            <p><strong>Név:</strong></p> <input type="text" name="name" defaultValue={profile.name} />
            <p><strong>Email:</strong></p> <input type="email" name="email" defaultValue={profile.email} />
            <p>
              <strong>Regisztráció dátuma:</strong>{" "}
              {new Date(profile.createdAt).toLocaleDateString("hu-HU")}
            </p>

            <button className={styles.editButton}>Adatok szerkesztése</button>

            <button
              className={styles.logoutButton}
              onClick={deleteSession}
            >
              Kijelentkezés
            </button>
          </div>

          <div className={styles.orderHistory}>
            <h3>Rendelési előzmények</h3>
            <ul className={styles.orderList}>
              <li className={styles.orderItem}>Rendelés #12345 - 2023.01.20 - 3,600 Ft</li>
              <li className={styles.orderItem}>Rendelés #12346 - 2023.01.21 - 2,400 Ft</li>
              <li className={styles.orderItem}>Rendelés #12347 - 2023.01.22 - 1,800 Ft</li>
            </ul>
          </div>

          <div className={styles.paymentMethods}>
            <h3>Fizetési módok</h3>
            <p>Hozzáadott fizetési módok még nincsenek.</p>
            <button className={styles.addPaymentButton}>Fizetési mód hozzáadása</button>
          </div>
        </div>
      </main>
    </div>
  );
}
