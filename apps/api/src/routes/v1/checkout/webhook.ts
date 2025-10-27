import { Order } from '@/entities/order.entity';
import Status from '@/enum/status';

import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET!, {
  apiVersion: '2025-08-27.basil'
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const post = async (
  req: Request,
  res: Response<{ received: boolean }>
) => {
  const db = (await orm).em.fork();

  try {
    const sig = req.getHeader('stripe-signature');

    if (!sig) {
      return res.error(Status.BadRequest, 'Missing stripe-signature header');
    }

    let event: Stripe.Event;

    try {
      // Get raw body (Buffer) from the request
      const rawBody = req.req.body;

      // Verify webhook signature with raw body
      event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Webhook signature verification failed:', errorMessage);
      return res.error(Status.BadRequest, `Webhook Error: ${errorMessage}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Update order status to paid
        if (session.metadata?.orderId) {
          const order = await db.findOne(Order, {
            id: BigInt(session.metadata.orderId)
          });

          if (order) {
            order.paymentStatus = 'paid';
            order.stripeSessionId = session.id;
            await db.flush();
            console.log(`Order ${order.id} marked as paid`);
          }
        }
        break;
      }

      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.metadata?.orderId) {
          const order = await db.findOne(Order, {
            id: BigInt(session.metadata.orderId)
          });

          if (order) {
            order.paymentStatus = 'paid';
            await db.flush();
            console.log(`Order ${order.id} marked as paid (async)`);
          }
        }
        break;
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.metadata?.orderId) {
          const order = await db.findOne(Order, {
            id: BigInt(session.metadata.orderId)
          });

          if (order) {
            order.paymentStatus = 'failed';
            await db.flush();
            console.log(`Order ${order.id} marked as failed`);
          }
        }
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.metadata?.orderId) {
          const order = await db.findOne(Order, {
            id: BigInt(session.metadata.orderId)
          });

          if (order && order.paymentStatus === 'pending') {
            order.paymentStatus = 'failed';
            await db.flush();
            console.log(`Order ${order.id} expired`);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(Status.Ok).json({ received: true });
  } catch (e: unknown) {
    console.error('Webhook error:', e);
    res.error(Status.InternalServerError, 'Webhook handler failed');
  }
};
