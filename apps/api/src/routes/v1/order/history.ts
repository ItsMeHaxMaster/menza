import { Order } from '@/entities/order.entity';
import Status from '@/enum/status';

import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';

import { z } from 'zod';

export const schemas = {
  get: {
    req: z.object({
      limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 10)),
      offset: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 0))
    }),
    res: z.object({
      orders: z.array(
        z.object({
          id: z.string(),
          totalAmount: z.number(),
          vat: z.number(),
          currency: z.string(),
          paymentStatus: z.string(),
          createdAt: z.string(),
          foods: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              price: z.number()
            })
          )
        })
      ),
      total: z.number(),
      hasMore: z.boolean()
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
        'You must be logged in to view order history'
      );
    }

    const { limit, offset } = req.validateQuery(schemas.get.req);

    // Fetch orders from database
    const [orders, total] = await db.findAndCount(
      Order,
      { user: user.id },
      {
        limit,
        offset,
        orderBy: { createdAt: 'DESC' },
        populate: ['foods', 'user']
      }
    );

    // Format the order history
    const formattedOrders = orders.map((order) => ({
      id: order.id.toString(),
      totalAmount: order.totalAmount,
      vat: order.vat,
      currency: order.currency,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt.toISOString(),
      foods: order.foods.getItems().map((food) => ({
        id: food.id.toString(),
        name: food.name,
        price: food.price
      }))
    }));

    res.status(Status.Ok).json({
      orders: formattedOrders,
      total,
      hasMore: offset + limit < total
    });
  } catch (e: unknown) {
    console.error(e);
    res.error(Status.InternalServerError, 'Internal Server Error');
  }
};
