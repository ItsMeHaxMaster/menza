import { Menu } from '@/entities/menu.entity';
import { MenuFood } from '@/entities/menu_food.entity';
import { Food } from '@/entities/food.entity';
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
            allergens: z.array(
              z.object({
                id: z.bigint(),
                name: z.string(),
                icon: z.string(),
                createdAt: z.date(),
                updatedAt: z.date()
              })
            ),
            createdAt: z.date(),
            updatedAt: z.date()
          })
        )
      })
    )
  },
  post: {
    req: z.object({
      year: z.number().default(new Date().getFullYear()),
      week: z.number(),
      days: z.record(
        z.enum(['1', '2', '3', '4', '5', '6']),
        z.array(z.string().transform((id: string) => BigInt(id))).length(3)
      )
    }),
    res: z.object({
      message: z.string()
    })
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

    // Find the menu for the specified week and year
    const menu = await db.findOne(Menu, {
      week: weekNum,
      year: yearNum
    });

    if (!menu)
      return res.error(Status.NotFound, 'Menu for this week is not found.');

    // Get all MenuFood entries for this menu
    const menuFoods = await db.find(
      MenuFood,
      { menu: menu.id },
      { populate: ['food', 'food.allergens'] }
    );

    if (menuFoods.length <= 0)
      return res.error(Status.NotFound, 'No foods found for this menu.');

    // Group by day
    const dayMap = new Map<number, typeof menuFoods>();
    for (const menuFood of menuFoods) {
      if (!dayMap.has(menuFood.day)) {
        dayMap.set(menuFood.day, []);
      }
      dayMap.get(menuFood.day)!.push(menuFood);
    }

    // Convert to response format
    const populatedMenus = Array.from(dayMap.entries()).map(
      ([day, menuFoods]) => {
        const populatedFoods = menuFoods.map((menuFood) => ({
          id: menuFood.food.id.toString(),
          name: menuFood.food.name,
          description: menuFood.food.description,
          price: menuFood.food.price,
          pictureId: menuFood.food.pictureId || '',
          allergens: menuFood.food.allergens.getItems(),
          createdAt: menuFood.food.createdAt,
          updatedAt: menuFood.food.updatedAt
        }));

        return {
          id: menu.id.toString(),
          year: menu.year,
          week: menu.week,
          day: day,
          foods: populatedFoods
        };
      }
    );

    res.status(Status.Ok).json(populatedMenus);
  } catch (e: unknown) {
    console.error(e);

    res.error(Status.InternalServerError, 'Internal Server Error');
  }
};

export const post = async (
  req: Request,
  res: Response<z.infer<typeof schemas.post.res>>
) => {
  const db = (await orm).em.fork();

  try {
    const { year, week, days } = req.validateBody(schemas.post.req);

    // get all foods from the db for the days.
    const foodsPerDay: {
      [key: string]: Food[];
    } = {};
    for (const [day, foods] of Object.entries(days)) {
      const f = await db.find(Food, { id: { $in: foods } });
      if (f.length !== foods.length) {
        return res.error(
          Status.BadRequest,
          `Invalid food ID(s) provided for day ${day}.`
        );
      }
      foodsPerDay[day] = f;
    }

    // check if a menu for the week already exists
    const has = await db.findOne(Menu, {
      year,
      week
    });
    if (has)
      return res.error(
        Status.Conflict,
        'There is already a menu present for this week.'
      );

    // create the menu
    const menu = db.create(Menu, {
      year,
      week
    });

    // create the menu food links
    const menuFoods: MenuFood[] = [];
    for (const day of Object.keys(days)) {
      const foods = foodsPerDay[day];
      for (const food of foods) {
        menuFoods.push(
          db.create(MenuFood, {
            menu,
            food,
            day: parseInt(day) || 1
          })
        );
      }
    }

    console.log([menu, ...menuFoods]);
    await db.persistAndFlush([menu, ...menuFoods]);

    res.status(Status.Ok).json({
      message: 'Menu created successfuly.'
    });
  } catch (e: any) {
    console.error(e);

    if (e.name === 'ValidationError')
      return res.error(
        Status.BadRequest,
        'The request body was malformed, required fields: `week` and `days` (with 3 food items per day).'
      );

    res.error(Status.InternalServerError, 'Internal Server Error');
  }
};
