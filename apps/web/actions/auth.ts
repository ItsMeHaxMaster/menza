'use server';

import api from '@/lib/api';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

interface AuthState {
  message: string;
}

export async function login(initialState: AuthState, formData: FormData, redirectUrl?: string) {
  const userData = {
    email: formData.get('email'),
    password: formData.get('password'),
    turnstile: formData.get('cf-turnstile-response')
  }

  try {
    const req = await fetch('http://localhost:3001/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    const data = await req.json();

    if (data.error)
      return { message: data.message };

    const cookieStore = await cookies();
    cookieStore.set('session_mz', data.jwt);

    redirect(redirectUrl || '/');
  } catch (e: unknown) {
    if (e instanceof Error && e.message === 'NEXT_REDIRECT') throw e;

    console.error(e);
    return { message: 'Very big hiba történt.' };
  }
}

export async function register(initialState: AuthState, formData: FormData) {
  const userData = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    turnstile: formData.get('cf-turnstile-response')
  }

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

    if (data.error)
      return { message: data.message };

    const cookieStore = await cookies();
    cookieStore.set('session_mz', data.jwt);

    redirect('/');
  } catch (e: unknown) {
    if (e instanceof Error && e.message === 'NEXT_REDIRECT') throw e;

    console.error(e);
    return { message: 'Very big hiba történt.' };
  }
}

export async function updateUser(formData: FormData) {
  const userData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
  }

  try {
    const data = await api.patchUser(userData.name, userData.email)
    
    console.log(data)
  } catch (e: unknown) {
    if (e instanceof Error && e.message === 'NEXT_REDIRECT') throw e;

    console.error(e);
  }
}
