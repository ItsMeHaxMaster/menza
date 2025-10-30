import { Food } from '@/entities/food.entity';
import { Menu } from '@/entities/menu.entity';
import { MenuFood } from '@/entities/menu_food.entity';
import { Order } from '@/entities/order.entity';
import { OrderFood } from '@/entities/order_food.entity';
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
      foods: z.array(
        z.object({
          id: z.string().transform((id: string) => BigInt(id)),
          day: z.number().int().min(1).max(5) // 1-5 for Monday-Friday
        })
      ),
      year: z.number().int().min(2020).max(2100),
      week: z.number().int().min(1).max(53)
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
    const { foods, year, week } = req.validateBody(schemas.post.req);

    // Extract unique days from the foods
    const days = [...new Set(foods.map((f) => f.day))];

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

    // Fetch the food items from the database and validate they exist in the menu
    // First, get the menu for the specified week/year
    const menu = await db.findOne(Menu, {
      year: year,
      week: week
    });

    if (!menu) {
      return res.error(
        Status.BadRequest,
        'No menu found for the specified week and year'
      );
    }

    // Get all MenuFood entries for this menu and the requested days
    const menuFoods = await db.find(
      MenuFood,
      {
        menu: menu.id,
        day: { $in: days }
      },
      { populate: ['food'] }
    );

    if (menuFoods.length === 0) {
      return res.error(
        Status.BadRequest,
        'No food items found for the specified week and days'
      );
    }

    // Create a map of food ID -> MenuFood entries for validation
    const menuFoodMap = new Map<string, MenuFood[]>();
    menuFoods.forEach((mf) => {
      const foodIdStr = mf.food.id.toString();
      if (!menuFoodMap.has(foodIdStr)) {
        menuFoodMap.set(foodIdStr, []);
      }
      menuFoodMap.get(foodIdStr)!.push(mf);
    });

    // Validate that all requested foods are available on their specified days
    const foodEntities: Food[] = [];
    for (const foodItem of foods) {
      const foodIdStr = foodItem.id.toString();
      const menuFoodEntries = menuFoodMap.get(foodIdStr);

      if (!menuFoodEntries) {
        return res.error(
          Status.BadRequest,
          `Food ${foodIdStr} is not available for this week`
        );
      }

      const hasMenuForDay = menuFoodEntries.some(
        (mf) => mf.day === foodItem.day
      );

      if (!hasMenuForDay) {
        return res.error(
          Status.BadRequest,
          `Food ${foodIdStr} is not available on day ${foodItem.day}`
        );
      }

      // Add the food entity if not already added
      const foodEntity = menuFoodEntries[0].food;
      if (!foodEntities.find((f) => f.id === foodEntity.id)) {
        foodEntities.push(foodEntity);
      }
    }

    // Calculate totals and VAT (27% included in price)
    const subtotal = foodEntities.reduce((sum, food) => sum + food.price, 0);
    const vat = subtotal * (0.27 / 1.27);

    // Create order in database
    const order = new Order();
    order.user = user;
    order.totalAmount = subtotal;
    order.vat = vat;
    order.paymentStatus = 'pending';
    order.currency = 'HUF';

    // Add the menu to the order
    order.menus.add(menu);

    // Create OrderFood entries for each food with their specific day
    for (const foodItem of foods) {
      const foodEntity = foodEntities.find((f) => f.id === foodItem.id);
      if (!foodEntity) continue;

      const orderFood = new OrderFood();
      orderFood.order = order;
      orderFood.food = foodEntity;
      orderFood.day = foodItem.day;
      db.persist(orderFood);
      order.foods.add(orderFood);
    }

    await db.persistAndFlush(order);

    // Helper to get day name in Hungarian
    const getDayName = (day: number): string => {
      const days = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek'];
      return days[day - 1] || '';
    };

    // Create line items for Stripe with week and day information
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = foods.map(
      (foodItem) => {
        // Find the food entity
        const food = foodEntities.find((f) => f.id === foodItem.id);
        if (!food) throw new Error(`Food not found: ${foodItem.id}`);

        const dayName = getDayName(foodItem.day);
        const description = `${year}. év, ${week}. hét - ${dayName}`;

        return {
          price_data: {
            currency: 'huf',
            product_data: {
              name: food.name,
              description: description,
              images: food.pictureId
                ? [`${process.env.CDN_URL || ''}/images/${food.pictureId}.jpg`]
                : [],
              tax_code: food.stripeTaxCode
            },
            unit_amount: Math.round(food.price * 100), // Stripe expects amount in cents/fillér
            tax_behavior: 'inclusive' // Price includes VAT
          },
          quantity: 1
        };
      }
    );

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'link', 'revolut_pay', 'samsung_pay'],
      line_items: [
        ...lineItems,
        {
          price_data: {
            currency: 'huf',
            product_data: {
              name: 'Kényelmi Díj',
              description: 'Csak mert miért ne.',
              tax_code: 'txcd_10000000'
            },
            unit_amount: Math.round(
              lineItems
                .map((item) => item.price_data!.unit_amount!)
                .reduce((p, c) => p + c) *
                0.0325 +
                8500
            ),
            tax_behavior: 'inclusive'
          },
          quantity: 1
        }
      ],
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
        foods: JSON.stringify(
          foods.map((f) => ({ id: f.id.toString(), day: f.day }))
        ),
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
