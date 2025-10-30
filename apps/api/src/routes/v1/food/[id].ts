import { Food } from '@/entities/food.entity';
import Status from '@/enum/status';
import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';

import { z } from 'zod';

export const schemas = {
  get: {
    res: z.object({
      id: z.bigint(),
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
  },
  del: {
    res: z.object({
      success: z.boolean(),
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
    const { id } = req.params;

    const food = await db.findOne(Food, {
      id
    });

    if (!food) return res.error(Status.NotFound, 'Food not found.');

    await food.allergens.init();
    res.status(Status.Ok).json({
      id: food.id,
      name: food.name,
      description: food.description,
      price: food.price,
      pictureId: food.pictureId || '',
      allergens: food.allergens.getItems(),
      createdAt: food.createdAt,
      updatedAt: food.updatedAt
    });
  } catch (e: unknown) {
    console.error(e);

    res.error(Status.InternalServerError, 'Internal Server Error');
  }
};

export const del = async (
  req: Request,
  res: Response<z.infer<typeof schemas.del.res>>
) => {
  const db = (await orm).em.fork();

  try {
    const { id } = req.params;

    const food = await db.findOne(Food, { id }, { populate: ['allergens'] });

    if (!food) {
      return res.error(Status.NotFound, 'Food item not found.');
    }

    // Remove the food item
    await db.removeAndFlush(food);

    return res.status(Status.Ok).json({
      success: true,
      message: 'Food item deleted successfully'
    });
  } catch (e: any) {
    console.error(e);
    return res.error(Status.InternalServerError, 'Internal Server Error');
  }
};
