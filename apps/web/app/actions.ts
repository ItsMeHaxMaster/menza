'use server';

import api from '@/lib/api';

export async function getFood(id: string) {
  return await api.getFood(id);
}

export async function deleteSession() {
  return await api.deleteSession();
}