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
  get: {
    req: z.object({
      orderId: z.string().transform((id: string) => BigInt(id))
    }),
    res: z.object({
      invoiceUrl: z.string()
    })
  }
};

export const get = async (
  req: Request,
  res: Response<z.infer<typeof schemas.get.res>>
) => {
  const db = (await orm).em.fork();

  try {
    // Get the authenticated user
    let user;
    try {
      user = await req.getUser();
    } catch {
      return res.error(
        Status.Unauthorized,
        'You must be logged in to view invoices'
      );
    }

    const { orderId } = req.validateQuery(schemas.get.req);

    // Fetch the order from database
    const order = await db.findOne(Order, { id: orderId, user: user.id });

    if (!order) {
      return res.error(Status.NotFound, 'Order not found');
    }

    if (!order.stripeSessionId) {
      return res.error(
        Status.BadRequest,
        'No Stripe session found for this order'
      );
    }

    // Get the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(
      order.stripeSessionId,
      {
        expand: ['invoice']
      }
    );

    if (!session.invoice) {
      return res.error(Status.NotFound, 'Invoice not found for this order');
    }

    // Get the invoice
    const invoice = session.invoice as Stripe.Invoice;

    if (!invoice.invoice_pdf) {
      return res.error(Status.NotFound, 'Invoice PDF not available');
    }

    res.status(Status.Ok).json({
      invoiceUrl: invoice.invoice_pdf
    });
  } catch (e: unknown) {
    console.error(e);

    if (e instanceof Stripe.errors.StripeError) {
      return res.error(Status.BadRequest, e.message);
    }

    res.error(Status.InternalServerError, 'Internal Server Error');
  }
};
