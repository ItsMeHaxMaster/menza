'use server';

import api from '@/lib/api';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function getSubtotal(items: (string|bigint)[]) {
  return await api.getSubtotal(items);
}

export async function createCheckoutSession(items: (string|bigint)[]) {
  return await api.createCheckoutSession(items);
}

export async function verifyCheckoutSession(sessionId: string) {
  return await api.verifyCheckoutSession(sessionId);
}

export async function getOrderHistory(limit?: number) {
  return await api.getOrderHistory(limit);
}

export async function getMenu(week: number, year: number) {
  return await api.getMenu(week, year);
}

export async function getFood(id: string) {
  return await api.getFood(id);
}

export async function deleteSession() {
  (await cookies()).delete('session_mz');
  redirect('/login');
}