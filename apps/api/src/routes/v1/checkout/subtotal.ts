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
      vat: z.number(),
      totalWithoutVat: z.number(),
      items: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          price: z.number(),
          vatRate: z.number(),
          vatAmount: z.number(),
          priceWithoutVat: z.number()
        })
      )
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

    // Calculate totals using individual food VAT rates
    let subtotal = 0;
    let totalVat = 0;
    const items = [];

    for (const food of foodEntities) {
      const vatAmount = food.vatAmount;
      const priceWithoutVat = food.priceWithoutVat;

      subtotal += food.price;
      totalVat += vatAmount;

      items.push({
        id: food.id.toString(),
        name: food.name,
        price: food.price,
        vatRate: food.vatRate,
        vatAmount: vatAmount,
        priceWithoutVat: priceWithoutVat
      });
    }

    const totalWithoutVat = subtotal - totalVat;

    res.status(Status.Ok).json({
      subtotal,
      vat: totalVat,
      totalWithoutVat,
      items
    });
  } catch (e: unknown) {
    console.error(e);

    res.error(Status.InternalServerError, 'Internal Server Error');
  }
};
