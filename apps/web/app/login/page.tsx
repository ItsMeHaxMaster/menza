'use client';
import React, { useActionState } from 'react';
import Link from 'next/link';
import '../globals.css';
import '../auth.modules.css';

import { login } from '@/actions/auth';
import Turnstile from '@/components/Turnstile';

// Turnstile site key - fallback for development
const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_PUBLIC || '1x00000000000000000000BB';

const initialState = {
  message: ''
};

/**
 * Login Page Component
 * Provides user authentication with Cloudflare Turnstile protection.
 * Handles form submission via server action and displays error messages.
 */
export default function Login() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="container">
      <form action={formAction} className="auth-form">
        <h2>Bejelentkezés</h2>

        <input type="email" name="email" placeholder="Email" required />

        <input type="password" name="password" placeholder="Jelszó" required />

        <Turnstile siteKey={TURNSTILE_SITE_KEY} />

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
