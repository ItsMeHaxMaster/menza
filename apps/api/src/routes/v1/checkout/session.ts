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
      foods: z.array(z.string().transform((id: string) => BigInt(id)))
    }),
    res: z.object({
      sessionId: z.string(),
      url: z.string()
    })
  }
};

export const post = async (
  req: Request,
  res: Response<z.infer<typeof schemas.post.res>>
) => {
  const db = (await orm).em.fork();

  try {
    const { foods } = req.validateBody(schemas.post.req);

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

    // Fetch the food items from the database
    const foodEntities = await db.find(Food, { id: { $in: foods } });

    if (foodEntities.length === 0) {
      return res.error(Status.BadRequest, 'No valid food items found');
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

    // Add foods to the order
    foodEntities.forEach((food) => order.foods.add(food));

    await db.persistAndFlush(order);

    // Create line items for Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      foodEntities.map((food) => ({
        price_data: {
          currency: 'huf',
          product_data: {
            name: food.name,
            images: food.pictureId
              ? [`${process.env.CDN_URL || ''}/images/${food.pictureId}.jpg`]
              : []
          },
          unit_amount: Math.round(food.price * 100) // Stripe expects amount in cents/fillér
        },
        quantity: 1
      }));

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'link', 'revolut_pay', 'samsung_pay'],
      line_items: lineItems,
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
        orderId: order.id.toString()
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
