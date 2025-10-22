'use server';

import api from '@/lib/api';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function getFood(id: string) {
  return await api.getFood(id);
}

export async function deleteSession() {
  (await cookies()).delete('session_mz');
  redirect('/login');
}