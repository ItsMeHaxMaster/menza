"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

import "../globals.css";
import "./page.modules.css";
import CartElement from "@/components/CartElement";

export default function CartPage() {
  const [cart, setCart] = useState<
    {
      id: string;
      date: { year: number; week: number; day: number };
    }[]
  >([]);
  useEffect(() => {
    const storedCart: 
    {
      id: string;
      date: { year: number; week: number; day: number };
    }[] = JSON.parse(localStorage.getItem("cart") || "[]");
    storedCart.sort((a, b) => a.date.day - b.date.day)
    setCart(storedCart);
  }, []);

  return (
    <main className="cart-container">
      <h1 className="cart-title">Kosár és fizetés</h1>

      <div className="cart-elements">
        {cart.map((food) => (
          <CartElement key={`${food.date.day}${food.date.week}`} foodCart={food} onDelete={() => {
            alert(JSON.stringify(food));

            const index = cart.findIndex(
              (item) =>
                item.id === food.id &&
                item.date.year === food.date.year &&
                item.date.week === food.date.week &&
                item.date.day === food.date.day
            );
            if (index !== -1) {
              cart.splice(index, 1);
            }
           }} />
        ))}

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
