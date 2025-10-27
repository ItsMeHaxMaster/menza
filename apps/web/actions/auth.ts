/**
 * Authentication Server Actions
 * Handles user login, registration, and profile updates
 * Uses Cloudflare Turnstile for CAPTCHA verification
 */

'use server';

import api from '@/lib/api';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * State interface for form action responses
 */
interface AuthState {
  message: string;
}

/**
 * Authenticates a user and creates a session
 * @param initialState - Previous form state
 * @param formData - Form data containing email, password, and turnstile token
 * @param redirectUrl - Optional URL to redirect after successful login
 * @returns Error message if login fails, otherwise redirects
 */
export async function login(
  initialState: AuthState,
  formData: FormData,
  redirectUrl?: string
) {
  const userData = {
    email: formData.get('email'),
    password: formData.get('password'),
    turnstile: formData.get('cf-turnstile-response')
  };

  try {
    // Direct fetch to API instead of using api wrapper for authentication
    const req = await fetch('http://localhost:3001/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    const data = await req.json();

    if (data.error) return { message: data.message };

    // Store JWT token in cookie for session management
    const cookieStore = await cookies();
    cookieStore.set('session_mz', data.jwt);

    redirect(redirectUrl || '/');
  } catch (e: unknown) {
    // NEXT_REDIRECT is expected and should be re-thrown
    if (e instanceof Error && e.message === 'NEXT_REDIRECT') throw e;

    console.error(e);
    return { message: 'Very big hiba történt.' };
  }
}

/**
 * Registers a new user account with validation
 * @param initialState - Previous form state
 * @param formData - Form data with name, email, password, and turnstile token
 * @returns Error message if registration fails, otherwise redirects to home
 */
export async function register(initialState: AuthState, formData: FormData) {
  const userData = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    turnstile: formData.get('cf-turnstile-response')
  };

  // Client-side password confirmation validation
  if (userData.password !== formData.get('password-repeat')) {
    return { message: 'A jelszavak nem egyezenek.' };
  }

  try {
    const req = await fetch('http://localhost:3001/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    const data = await req.json();

    if (data.error) return { message: data.message };

    const cookieStore = await cookies();
    cookieStore.set('session_mz', data.jwt);

    redirect('/');
  } catch (e: unknown) {
    if (e instanceof Error && e.message === 'NEXT_REDIRECT') throw e;

    console.error(e);
    return { message: 'Very big hiba történt.' };
  }
}

/**
 * Updates user profile information
 * @param formData - Form data with updated name and email
 * Revalidates the profile page to show updated data
 */
export async function updateUser(formData: FormData) {
  const userData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string
  };

  try {
    const data = await api.patchUser(userData.name, userData.email);

    // Refresh the profile page with updated data
    revalidatePath('/profile');
  } catch (e: unknown) {
    if (e instanceof Error && e.message === 'NEXT_REDIRECT') throw e;

    console.error(e);
  }
}
