'use client';

import Link from 'next/link';
import { UtensilsCrossed, ShoppingCart, User } from 'lucide-react';
import styles from './Navbar.module.css';
import CartCounter from './CartCounter';

type NavbarPage = 'home' | 'profile' | 'cart';

interface NavbarProps {
  logoSection?: React.ReactNode;
  currentPage: NavbarPage;
}

export default function Navbar({ logoSection, currentPage }: NavbarProps) {
  const navItems = [
    {
      href: '/',
      icon: <UtensilsCrossed size={24} />,
      label: 'Menü',
      page: 'home' as NavbarPage,
      badge: null
    },
    {
      href: '/profile',
      icon: <User size={24} />,
      label: 'Profil',
      page: 'profile' as NavbarPage,
      badge: null
    },
    {
      href: '/cart',
      icon: <ShoppingCart size={24} />,
      label: 'Kosár',
      page: 'cart' as NavbarPage,
      badge: <CartCounter />
    }
  ];

  return (
    <header className={styles.header}>
      {logoSection}
      <nav className={styles.navbar}>
        {navItems
          .filter(item => item.page !== currentPage)
          .map(item => (
            <Link key={item.page} className={styles.navButton} href={item.href}>
              {item.icon}
              <span>{item.label}</span>
              {item.badge}
            </Link>
          ))}
      </nav>
    </header>
  );
}