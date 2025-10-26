import { redirect } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { UtensilsCrossed, ShoppingCart, User } from 'lucide-react';
import api from '@/lib/api';
import { deleteSession } from '../../actions/actions';
import CartCounter from '@/components/CartCounter';
import { updateUser } from '@/actions/auth';
import { useActionState } from 'react';

interface OrderFood {
  id: string;
  name: string;
  price: number;
}

interface Order {
  id: string;
  totalAmount: number;
  vat: number;
  currency: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
  foods: OrderFood[];
}

interface OrderHistory {
  orders: Order[];
  total: number;
  hasMore: boolean;
}

export default async function Profile() {
  const profile = await api.getUser();

  if (!profile) {
    redirect('/login');
  }

  const orders = (await api.getOrderHistory(5)) as OrderHistory | null;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logoSection}>
          <div className={styles.logo}>
            <User />
          </div>
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
            <CartCounter />
          </Link>
        </nav>
      </header>

      <main className={styles.main}>
        <div className={styles.profileContainer}>
          <div className={styles.profileHeader}>
            <div className={styles.avatar}>
              {profile.name
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()}
            </div>
            <div>
              <h2 className={styles.userName}>{profile.name}</h2>
              <p className={styles.userEmail}>{profile.email}</p>
            </div>
          </div>

          <form className={styles.profileDetails} action={updateUser}>
            <h3>Felhasználói adatok</h3>
            <p>
              <strong>Név:</strong>
            </p>{' '}
            <input
              type="text"
              name="name"
              defaultValue={profile.name}
              required
            />
            <p>
              <strong>Email:</strong>
            </p>{' '}
            <input
              type="email"
              name="email"
              defaultValue={profile.email}
              required
            />
            <p>
              <strong>Regisztráció dátuma:</strong>{' '}
              {new Date(profile.createdAt).toLocaleDateString('hu-HU')}
            </p>
            <button className={styles.editButton} type="submit">
              Mentés
            </button>
            <button className={styles.logoutButton} onClick={deleteSession}>
              Kijelentkezés
            </button>
          </form>

          <div className={styles.orderHistory}>
            <h3>Rendelési előzmények</h3>
            {orders ? (
              <ul className={styles.orderList}>
                {orders.orders.map((order) => (
                  <li key={order.id} className={styles.orderItem}>
                    <div className={styles.orderHeader}>
                      <span className={styles.orderId}>
                        Rendelés #{order.id}
                      </span>
                      <span className={styles.orderDate}>
                        {new Date(order.createdAt).toLocaleDateString('hu-HU', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className={styles.orderDetails}>
                      <div className={styles.orderAmount}>
                        {new Intl.NumberFormat('hu-HU', {
                          style: 'currency',
                          currency: order.currency
                        }).format(order.totalAmount)}
                      </div>
                      <div
                        className={`${styles.orderStatus} ${styles[order.paymentStatus]}`}
                      >
                        {(() => {
                          switch (order.paymentStatus) {
                            case 'pending':
                              return 'Feldolgozás';
                            case 'paid':
                              return 'Kifizetve';
                            case 'failed':
                              return 'Elutasítva';
                            case 'refunded':
                              return 'Visszafizetve';
                          }
                        })()}
                      </div>
                    </div>
                    <div className={styles.orderFoods}>
                      {order.foods.map((food) => (
                        <div key={food.id} className={styles.foodItem}>
                          <span className={styles.foodName}>{food.name}</span>
                          <span className={styles.foodPrice}>
                            {new Intl.NumberFormat('hu-HU', {
                              style: 'currency',
                              currency: order.currency
                            }).format(food.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Nem sikerült betölteni a rendelési előzményeket.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
