import { Menu } from '@/entities/menu.entity';
import Status from '@/enum/status';

import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';

import { z } from 'zod';

export const schemas = {
  get: {
    req: z.object({
      week: z.string(),
      year: z.string().optional()
    }),
    res: z.array(
      z.object({
        id: z.string(),
        year: z.number(),
        week: z.number(),
        day: z.number(),
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
    const { week, year } = req.validateQuery(schemas.get.req);

    const weekNum = parseInt(week);
    const yearNum = year ? parseInt(year) : new Date().getFullYear();

    const weekMenus = await db.find(Menu, {
      week: weekNum,
      year: yearNum
    });

    if (weekMenus.length <= 0)
      return res.error(Status.NotFound, 'Menu for this week is not found.');

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
          year: menu.year,
          week: menu.week,
          day: menu.day,
          foods: populatedFoods
        };
      })
    );

    res.status(Status.Ok).json(populatedMenus);
  } catch (e: unknown) {
    console.error(e);

    res.error(Status.InternalServerError, 'Internal Server Error');
  }
};
