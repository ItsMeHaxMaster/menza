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

      headers: {
        ...settings?.headers,

        // @ts-expect-error we set to null, essentially like we didn't set it at all.
        Authorization: (await this.hasSessionCookie())
          ? `Bearer ${await this.getSessionToken()}`
          : null,
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
      const user = await this.fetch('/v1/user/me');
      if (!user.ok) return null;
      return await user.json();
    } catch {
      return null;
    }
  });

  public patchUser = async (name?: string, email?: string) => {
    try {
      const user = await this.fetch('/v1/user/me', {
        method: 'PATCH',
        body: JSON.stringify({ name, email }),
        headers: { 'Content-Type': 'application/json' }
      });
      if (!user.ok) return user.json();
      return await user.json();
    } catch {
      return null;
    }
  };

  public getSubtotal = cache(async (items: (string | bigint)[]) => {
    try {
      const urlSafe = encodeURIComponent(JSON.stringify(items));
      const subtotal = await this.fetch(
        `/v1/checkout/subtotal?foods=${urlSafe}`
      );
      if (!subtotal.ok) return null;
      return await subtotal.json();
    } catch {
      return null;
    }
  });

  public createCheckoutSession = async (
    items: Array<{ id: string | bigint; day: number }>,
    year: number,
    week: number
  ) => {
    try {
      const session = await this.fetch('/v1/checkout/session', {
        method: 'POST',
        body: JSON.stringify({
          foods: items.map((item) => ({
            id: item.id.toString(),
            day: item.day
          })),
          year,
          week
        }),
        headers: { 'Content-Type': 'application/json' }
      });
      if (!session.ok) {
        const errorData = await session.json();
        console.error('Checkout session error:', errorData);
        return null;
      }
      return await session.json();
    } catch (e) {
      console.error('Checkout session exception:', e);
      return null;
    }
  };

  public verifyCheckoutSession = async (sessionId: string) => {
    try {
      const verification = await this.fetch(
        `/v1/checkout/verify?session_id=${sessionId}`
      );
      if (!verification.ok) return null;
      return await verification.json();
    } catch {
      return null;
    }
  };

  public getOrderHistory = cache(async (limit?: number) => {
    try {
      const limitParam = limit ? `?limit=${limit}` : '';
      const history = await this.fetch(`/v1/order/history${limitParam}`);
      if (!history.ok) return null;
      return await history.json();
    } catch {
      return null;
    }
  });

  public getInvoiceUrl = async (orderId: string) => {
    try {
      const invoice = await this.fetch(`/v1/order/invoice?orderId=${orderId}`);
      if (!invoice.ok) return null;
      return await invoice.json();
    } catch {
      return null;
    }
  };
}

const api = new Api();

export default api;
