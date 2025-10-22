"use client";
import React, { useActionState } from "react";
import Link from "next/link";
import "../globals.css";
import "../auth.modules.css";

import { login } from "@/actions/auth";
import Turnstile from "@/components/Turnstile";

// 0x4AAAAAAB3E4tl6nWFLbTmH

const initialState = {
  message: "",
};

export default function Register() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="container">
      <form action={formAction} className="auth-form">
        <h2>Bejelentkezés</h2>

        <input type="email" name="email" placeholder="Email" required />

        <input type="password" name="password" placeholder="Jelszó" required />

        <Turnstile siteKey="1x00000000000000000000BB" />

        <button type="submit" disabled={pending}>
          Bejelentkezek
        </button>

        <Link href="/register" id="auth-opp-btn">
          Regisztrálás
        </Link>

        {state!.message && <p className="form-message">{state!.message}</p>}
      </form>
    </div>
  );
}
