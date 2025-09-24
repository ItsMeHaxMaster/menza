import { Menu } from '@/entities/menu.entity';
import Status from '@/enum/status';

import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';

import { z } from 'zod';

export const schemas = {
  get: {
    req: z.object({
      week_start: z.string()
    }),
    res: z.array(
      z.object({
        id: z.string(),
        date: z.date(),
        foods: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            description: z.string(),
            price: z.number(),
            pictureId: z.string(),
            allergens: z.array(z.string())
          })
        )
      })
    )
  }
};

export const get = async (
  req: Request,
  res: Response<z.infer<typeof schemas.get.res>>
) => {
  const db = (await orm).em.fork();

  try {
    const { week_start } = req.validateQuery(schemas.get.req);

    const monday = new Date(parseInt(week_start));
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);

    const weekMenus = await db.find(Menu, {
      date: {
        $gte: monday,
        $lte: friday
      }
    });

    const populatedMenus = await Promise.all(
      weekMenus.map(async (menu) => {
        await menu.foods.init();

        const populatedFoods = await Promise.all(
          menu.foods.getItems().map(async (food) => {
            await food.allergens.init();

            return {
              id: food.id.toString(),
              name: food.name,
              description: food.description,
              price: food.price,
              pictureId: food.pictureId,
              allergens: food.allergens
                .getItems()
                .map((allergen) => allergen.id.toString())
            };
          })
        );

        return {
          id: menu.id.toString(),
          date: menu.date,
          foods: populatedFoods
        };
      })
    );

    res.status(Status.Ok).json(populatedMenus);
  } catch (e: unknown) {
    console.error(e);
  }
};
