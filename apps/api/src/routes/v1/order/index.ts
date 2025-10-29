import { Menu } from '@/entities/menu.entity';
import Status from '@/enum/status';

import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';

import { z } from 'zod';

export const schemas = {
  get: {
    req: z.object({
      year: z
        .string()
        .transform((val) => (val ? parseInt(val) : new Date().getFullYear()))
        .default(new Date().getFullYear().toString()),
      week: z.string().transform((val) => parseInt(val!, 10)),
      day: z.string().optional()
    })
  }
};

export const get = async (req: Request, res: Response<unknown>) => {
  const db = (await orm).em.fork();

  try {
    const { year, week, day } = req.validate(schemas.get.req, req.query);

    const menu = await db.findOne(Menu, {
      year,
      week
    });

    if (!menu) {
      return res.status(Status.Ok).json({});
    }

    await menu?.orders.init();

    // Collect all order foods from all orders
    const allOrderFoods: Array<{
      foodId: bigint;
      name: string;
      price: number;
      day: number;
    }> = [];

    await Promise.all(
      menu?.orders.getItems().map(async (order) => {
        // Populate the OrderFood items with their associated Food entities
        await order.foods.init({ populate: ['food'] });

        const orderFoods = order.foods.getItems();
        orderFoods.forEach((of) => {
          allOrderFoods.push({
            foodId: of.food.id,
            name: of.food.name,
            price: of.food.price,
            day: of.day
          });
        });
      }) ?? []
    );

    // Group by food ID and day, counting occurrences
    const foodCounts: Record<
      string,
      {
        id: string;
        name: string;
        price: number;
        days: Record<number, number>;
      }
    > = {};

    allOrderFoods.forEach((of) => {
      // Filter by day if specified
      if (day && of.day !== parseInt(day, 10)) {
        return;
      }

      const foodKey = of.foodId.toString();

      if (!foodCounts[foodKey]) {
        foodCounts[foodKey] = {
          id: foodKey,
          name: of.name,
          price: of.price,
          days: {}
        };
      }

      // Initialize day count if not exists
      if (!foodCounts[foodKey].days[of.day]) {
        foodCounts[foodKey].days[of.day] = 0;
      }

      // Increment count for this food on this day
      foodCounts[foodKey].days[of.day]++;
    });

    // Convert to array format
    const result = Object.values(foodCounts);

    res.status(Status.Ok).json(result);
  } catch (e: unknown) {
    console.error(e);
    res.error(Status.InternalServerError, 'Internal Server Error');
  }
};
