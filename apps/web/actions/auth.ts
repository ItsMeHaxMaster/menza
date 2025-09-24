'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(initialState: any, formData: FormData) {
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

    redirect('/');
  } catch (e: any) {
    console.error(e);
    return { message: 'Very big hiba történt.' };
  }
}

export async function register(initialState: any, formData: FormData) {
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
  } catch (e: any) {
    console.error(e);
    return { message: 'Very big hiba történt.' };
  }
}
