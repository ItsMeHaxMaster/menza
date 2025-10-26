import { Food } from '@/entities/food.entity';
import { Order } from '@/entities/order.entity';
import Status from '@/enum/status';

import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';

import { z } from 'zod';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET!, {
  apiVersion: '2025-08-27.basil'
});

export const schemas = {
  post: {
    req: z.object({
      foods: z.array(z.string().transform((id: string) => BigInt(id))),
      year: z.number().int().min(2020).max(2100),
      week: z.number().int().min(1).max(53),
      days: z.array(z.number().int().min(1).max(5)) // 1-5 for Monday-Friday
    }),
    res: z.object({
      sessionId: z.string(),
      url: z.string()
    })
  }
};

// Helper function to get ISO week number
function getISOWeek(date: Date): { year: number; week: number } {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return { year: d.getUTCFullYear(), week: weekNo };
}

export const post = async (
  req: Request,
  res: Response<z.infer<typeof schemas.post.res>>
) => {
  const db = (await orm).em.fork();

  try {
    const { foods, year, week, days } = req.validateBody(schemas.post.req);

    // Get the authenticated user
    let user;
    try {
      user = await req.getUser();
    } catch {
      return res.error(
        Status.Unauthorized,
        'You must be logged in to checkout'
      );
    }

    // Validate that the order is for a valid week (current week or up to 2 weeks ahead)
    const now = new Date();
    const currentWeekData = getISOWeek(now);
    const currentWeek = currentWeekData.week;
    const currentYear = currentWeekData.year;

    // Calculate valid weeks
    const validWeeks: Array<{ year: number; week: number }> = [];
    for (let i = 0; i < 3; i++) {
      const weekOffset = currentWeek + i;
      // Simple validation - handle year wrap (simplified for most cases)
      if (weekOffset <= 52) {
        validWeeks.push({ year: currentYear, week: weekOffset });
      } else {
        validWeeks.push({ year: currentYear + 1, week: weekOffset - 52 });
      }
    }

    const isValidWeek = validWeeks.some(
      (w) => w.year === year && w.week === week
    );

    if (!isValidWeek) {
      return res.error(
        Status.BadRequest,
        'You can only order for the current week or up to 2 weeks ahead'
      );
    }

    // Fetch the food items from the database with their menus
    // Filter by year, week, and days
    const foodEntities = await db.find(
      Food,
      {
        id: { $in: foods },
        menus: {
          year: year,
          week: week,
          day: { $in: days }
        }
      },
      { populate: ['menus'] }
    );

    if (foodEntities.length === 0) {
      return res.error(
        Status.BadRequest,
        'No valid food items found for the specified week and days'
      );
    }

    // Validate that we found all requested foods
    if (foodEntities.length !== foods.length) {
      return res.error(
        Status.BadRequest,
        'Some food items are not available for the specified week and days'
      );
    }

    // Calculate totals and VAT (27% included in price)
    const subtotal = foodEntities.reduce((sum, food) => sum + food.price, 0);
    const vat = subtotal * (0.27 / 1.27);

    // Collect all unique menus from the foods (matching the year, week, and days)
    const menuSet = new Set<bigint>();
    foodEntities.forEach((food) => {
      food.menus.getItems().forEach((menu) => {
        if (
          menu.year === year &&
          menu.week === week &&
          days.includes(menu.day)
        ) {
          menuSet.add(menu.id);
        }
      });
    });

    // Create order in database
    const order = new Order();
    order.user = user;
    order.totalAmount = subtotal;
    order.vat = vat;
    order.paymentStatus = 'pending';
    order.currency = 'HUF';

    // Add foods to the order
    foodEntities.forEach((food) => order.foods.add(food));

    // Add menus to the order
    foodEntities.forEach((food) => {
      food.menus.getItems().forEach((menu) => {
        if (
          menu.year === year &&
          menu.week === week &&
          days.includes(menu.day)
        ) {
          order.menus.add(menu);
        }
      });
    });

    await db.persistAndFlush(order);

    // Helper to get day name in Hungarian
    const getDayName = (day: number): string => {
      const days = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek'];
      return days[day - 1] || '';
    };

    // Create line items for Stripe with week and day information
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      foodEntities.map((food) => {
        // Find the matching menu for this food to get the day
        const matchingMenu = food.menus
          .getItems()
          .find(
            (m) => m.year === year && m.week === week && days.includes(m.day)
          );

        const dayName = matchingMenu ? getDayName(matchingMenu.day) : '';
        const description = `${year}. év, ${week}. hét - ${dayName}`;

        return {
          price_data: {
            currency: 'huf',
            product_data: {
              name: food.name,
              description: description,
              images: food.pictureId
                ? [`${process.env.CDN_URL || ''}/images/${food.pictureId}.jpg`]
                : []
            },
            unit_amount: Math.round(food.price * 100) // Stripe expects amount in cents/fillér
          },
          quantity: 1
        };
      });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'link', 'revolut_pay', 'samsung_pay'],
      line_items: lineItems,
      billing_address_collection: 'required',
      invoice_creation: {
        enabled: true
      },
      mode: 'payment',
      success_url: `${process.env.WEB_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.WEB_URL || 'http://localhost:3000'}/cart`,
      customer_email: user.email,
      automatic_tax: {
        enabled: true
      },
      metadata: {
        foods: JSON.stringify(foods.map((id: bigint) => id.toString())),
        userId: user.id.toString(),
        userName: user.name,
        subtotal: subtotal.toFixed(2),
        vat: vat.toFixed(2),
        vatRate: '27',
        orderId: order.id.toString(),
        year: year.toString(),
        week: week.toString(),
        days: JSON.stringify(days)
      },
      locale: 'hu'
    });

    // Update order with Stripe session ID
    order.stripeSessionId = session.id;
    await db.flush();

    res.status(Status.Ok).json({
      sessionId: session.id,
      url: session.url!
    });
  } catch (e: unknown) {
    console.error(e);

    if (e instanceof Stripe.errors.StripeError) {
      return res.error(Status.BadRequest, e.message);
    }

    res.error(Status.InternalServerError, 'Internal Server Error');
  }
};
