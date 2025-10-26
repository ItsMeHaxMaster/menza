import Status from '@/enum/status';

import { Request, Response } from '@/util/handler';

import { z } from 'zod';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET!, {
  apiVersion: '2025-08-27.basil'
});

export const schemas = {
  get: {
    req: z.object({
      session_id: z.string()
    }),
    res: z.object({
      status: z.string(),
      customer_email: z.string().optional(),
      amount_total: z.number().optional()
    })
  }
};

export const get = async (
  req: Request,
  res: Response<z.infer<typeof schemas.get.res>>
) => {
  try {
    const { session_id } = req.validateQuery(schemas.get.req);

    const session = await stripe.checkout.sessions.retrieve(session_id);

    res.status(Status.Ok).json({
      status: session.status || 'unknown',
      customer_email: session.customer_details?.email || undefined,
      amount_total: session.amount_total
        ? session.amount_total / 100
        : undefined
    });
  } catch (e: unknown) {
    console.error(e);

    if (e instanceof Stripe.errors.StripeError) {
      return res.error(Status.BadRequest, e.message);
    }

    res.error(Status.InternalServerError, 'Internal Server Error');
  }
};
