"use client";
import React, { useState } from "react";
import "../globals.css";
import "../auth.modules.css";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
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
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        setMessage(err.message || "Hiba történt.");
      } else {
        const data = await res.json();
        setMessage("Sikeres regisztráció 🎉");
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
    <h2>Regisztráció</h2>

    <input
      type="text"
      name="name"
      placeholder="Név"
      value={form.name}
      onChange={handleChange}
      required
    />

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
      {loading ? "Küldés..." : "Regisztrálok"}
    </button>

    <a href="./Login" id="auth-opp-btn">Bejelentkezés</a>

    {message && <p className="form-message">{message}</p>}
  </form>
</div>
  );
}