"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React from "react";

import "../globals.css";
import "./page.modules.css";

export default function CartPage() {
  const router = useRouter();

  return (
    <main className="cart-container">
      <h1 className="cart-title">Kosár és fizetés</h1>

      <div className="cart-elements">
        {}
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