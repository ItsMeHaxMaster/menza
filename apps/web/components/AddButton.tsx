"use client";

import { ShoppingBasket, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function AddButton({
  className,
  foodId,
  date,
  onClick
}: {
  className?: string;
  foodId: string;
  date: { year: number; week: number; day: number };
  onClick?: any;
}) {
  const [action, setAction] = useState(false);

  useEffect(() => {
    const cart: {
      id: string;
      date: { year: number; week: number; day: number };
    }[] = JSON.parse(localStorage.getItem("cart") || "[]");
    if (
      cart.find(
        (item) =>
          item.id === foodId &&
          item.date.year === date.year &&
          item.date.week === date.week &&
          item.date.day === date.day
      )
    ) {
      setAction(true);
    }
  }, [foodId, date]);

  const click = () => {
    const cart: {
      id: string;
      date: { year: number; week: number; day: number };
    }[] = JSON.parse(localStorage.getItem("cart") || "[]");
    if (action) {
      const index = cart.findIndex(
        (item) =>
          item.id === foodId &&
          item.date.year === date.year &&
          item.date.week === date.week &&
          item.date.day === date.day
      );
      if (index !== -1) {
        cart.splice(index, 1);
        setAction(false);
      }
    } else {
      if (
        !cart.find(
          (item) =>
            item.id === foodId &&
            item.date.year === date.year &&
            item.date.week === date.week &&
            item.date.day === date.day
        )
      ) {
        cart.push({ id: foodId, date });
      }
      setAction(true);
    }
    localStorage.setItem("cart", JSON.stringify(cart));

    onClick();
  };
  return (
    <button className={className} data-action={action} onClick={click}>
      {action ? <Trash2 /> : <ShoppingBasket />}
    </button>
  );
}
