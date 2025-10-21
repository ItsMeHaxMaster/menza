"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import { UtensilsCrossed, ShoppingCart, User } from "lucide-react";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

//

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/profile`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) {
          setError("Hiba történt a profil betöltésekor.");
          setLoading(false);
          return;
        }

        const { id, name, email, createdAt }: ProfileData = await res.json();
        setProfile({ id, name, email, createdAt });
        setLoading(false);
      } catch (error) {
        setError("Hiba történt a profil betöltésekor.");
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div className={styles.page}>Betöltés...</div>;

  if (error)
    return (
      <div className={styles.page}>
        <div className={styles.errorContainer}>
          <h2 className={styles.errorTitle}>Hiba történt</h2>
          <p className={styles.errorMessage}>{error}</p>
          <Link href="/login" className={styles.retryButton}>
            Bejelentkezés újra
          </Link>
        </div>
      </div>
    );

  if (!profile) return <div className={styles.page}>Nincs adat.</div>;

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
                .map((n) => n[0])
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
            <p><strong>Név:</strong> {}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p>
              <strong>Regisztráció dátuma:</strong>{" "}
              {new Date(profile.createdAt).toLocaleDateString("hu-HU")}
            </p>

            <button className={styles.editButton}>Adatok szerkesztése</button>

            <button
              className={styles.logoutButton}
              onClick={() => {
                // cookie törlése
                document.cookie = "session_mz=; max-age=0; path=/";
                window.location.href = "/login";
              }}
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
