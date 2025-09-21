"use client";
import React, { useState } from "react";
import "../globals.css";

export default function Register() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    turnstile: "", 
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        setMessage(err.message || "Hiba történt.");
      } else {
        const data = await res.json();
        setMessage("Sikeres bejelentkezés 🎉");
        console.log("JWT:", data.jwt);
      }
    } catch (error) {
      setMessage("Szerver hiba!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
  <form onSubmit={handleSubmit} className="auth-form">
    <h2>Bejelentkezés</h2>

    <input
      type="email"
      name="email"
      placeholder="Email"
      value={form.email}
      onChange={handleChange}
      required
    />

    <input
      type="password"
      name="password"
      placeholder="Jelszó"
      value={form.password}
      onChange={handleChange}
      required
    />

    <button type="submit" disabled={loading}>
      {loading ? "Küldés..." : "Bejelentkezek"}
    </button>

    <a href="./Registration" id="auth-opp-btn">Regisztráció</a>

    {message && <p className="form-message">{message}</p>}
  </form>
</div>
  );
}