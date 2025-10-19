"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

import "../globals.css";
import "./page.modules.css";

export default function CartPage() {
  const router = useRouter();

  const [cart, setCart] = useState<
    {
      id: string;
      date: { year: number; week: number; day: number };
    }[]
  >([]);
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(storedCart);
  }, []);

  return (
    <main className="cart-container">
      <h1 className="cart-title">Kosár és fizetés</h1>

      <div className="cart-elements">
        {JSON.stringify(cart)}
        <p className="empty-cart">A kosár jelenleg üres.</p>
      </div>

      <div className="cart-buttons">
        <Link href="" className="btn btn-blue">
          Fizetés
        </Link>
        <Link href="/" className="btn btn-blue">
          Vissza a menühöz
        </Link>
      </div>
    </main>
  );
}
