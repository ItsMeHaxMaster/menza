"use client";
import React, { useActionState, useState } from "react";
import Link from "next/link";
import "../globals.css";
import "../auth.modules.css";
import { register } from "@/actions/auth";

const initialState = {
  message: '',
}

export default function Register() {
  const [state, formAction, pending] = useActionState(register, initialState);

  return (
    <div className="container">
      <form action={formAction} className="auth-form">
        <h2>Regisztráció</h2>

        <input
          type="text"
          name="name"
          placeholder="Név"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Jelszó"
          required
        />

        <input
          type="password"
          name="password-repeat"
          placeholder="Jelszó Újra"
          required
        />

        <div className="cf-turnstile" data-sitekey="1x00000000000000000000BB" />

        <button type="submit" disabled={pending}>
          Regisztrálok
        </button>

        <Link href="/login" id="auth-opp-btn">
          Bejelentkezés
        </Link>

        {state!.message && <p className="form-message">{state!.message}</p>}
      </form>
    </div>
  );
}