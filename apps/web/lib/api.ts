import 'server-only';

import { cookies } from 'next/headers';
import { cache } from 'react';

class Api {
  public hasSessionCookie = cache(async () => {
    const cookie = (await cookies()).get('session_mz')?.value;

    if (!cookie) return false;
    else return true;
  });

  public getSessionToken = cache(async () => {
    if (!(await this.hasSessionCookie())) return null;
    return (await cookies()).get('session_mz')?.value;
  });

  private async fetch(url: string, settings?: RequestInit) {
    console.log(`${process.env.NEXT_PUBLIC_API_URL!}${url}`);
    return fetch(`${process.env.NEXT_PUBLIC_API_URL!}${url}`, {
      ...settings,
      // @ts-expect-error we set to null, essentially like we didn't set it at all.
      headers: {
        Authorization: (await this.hasSessionCookie()) ? `Bearer ${await this.getSessionToken()}` : null,
        'User-Agent': 'MenzaWeb/1.0.0'
      }
    });
  }

  public getMenu = cache(async (week: number, year?: number) => {
    try {
      const yearParam = year ? `&year=${year}` : '';
      const menu = await this.fetch(`/v1/menu?week=${week}${yearParam}`);
      if (!menu.ok) return null;
      return await menu.json();
    } catch {
      return null;
    }
  });

  public getFood = cache(async (id: string) => {
    try {
      const food = await this.fetch(`/v1/food/${id}`);
      if (!food.ok) return null;
      return await food.json();
    } catch {
      return null;
    }
  });

  public getUser = cache(async () => {
    try {
      const user = await this.fetch(`/v1/user/me`);
      if (!user.ok) return null;
      return await user.json();
    } catch {
      return null;
    }
  });
  
  public patchUser = cache(async (name?:string, email?:string) => {
    try {
      const user = await this.fetch(`/v1/user/me`, {
        method: 'PATCH',
        body: JSON.stringify({ name, email }),
        headers: { 'Content-Type': 'application/json' }
      });
      if (!user.ok) return null;
      return await user.json();
    } catch {
      return null;
    }
  });
}

const api = new Api();

export default api;
