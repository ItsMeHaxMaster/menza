'use client';
import React, { useActionState } from 'react';
import Link from 'next/link';
import '../globals.css';
import '../auth.modules.css';
import { register } from '@/actions/auth';
import Turnstile from '@/components/Turnstile';

const initialState = {
  message: ''
};

export default function Register() {
  const [state, formAction, pending] = useActionState(register, initialState);

  return (
    <div className="container">
      <form action={formAction} className="auth-form">
        <h2>Regisztráció</h2>

        <input type="text" name="name" placeholder="Név" required />

        <input type="email" name="email" placeholder="Email" required />

        <input type="password" name="password" placeholder="Jelszó" required />

        <input
          type="password"
          name="password-repeat"
          placeholder="Jelszó Újra"
          required
        />

        <Turnstile siteKey={process.env.NEXT_PUBLIC_TURNSTILE_PUBLIC!} />

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
