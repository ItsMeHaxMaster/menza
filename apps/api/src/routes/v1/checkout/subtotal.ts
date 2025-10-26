import { Food } from '@/entities/food.entity';
import Status from '@/enum/status';

import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';

import { z } from 'zod';

export const schemas = {
  get: {
    req: z.object({
      foods: z
        .string()
        .transform((val) => JSON.parse(val).map((id: string) => BigInt(id)))
    }),
    res: z.object({
      subtotal: z.number(),
      vat: z.number()
    })
  }
};

export const get = async (
  req: Request,
  res: Response<z.infer<typeof schemas.get.res>>
) => {
  const db = (await orm).em.fork();

  try {
    const { foods } = req.validateQuery(schemas.get.req) as { foods: bigint[] };

    const foodEntities = await db.find(Food, { id: { $in: foods } });

    console.log(foods, foodEntities);

    const subtotal = foodEntities.reduce((sum, food) => sum + food.price, 0);
    const vat = subtotal * (0.27 / 1.27);

    res.status(Status.Ok).json({
      subtotal,
      vat
    });
  } catch (e: unknown) {
    console.error(e);

    res.error(Status.InternalServerError, 'Internal Server Error');
  }
};
