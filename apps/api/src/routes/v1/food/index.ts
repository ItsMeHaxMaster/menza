import { Request, Response } from '@/util/handler';
import Status from '@/enum/status';
import { z } from 'zod';
import { orm } from '@/util/orm';
import { Food } from '@/entities/food.entity';
import { Allergen } from '@/entities/allergen.entity';

export const schemas = {
  post: {
    req: z.object({
      name: z.string(),
      description: z.string(),
      price: z.number(),
      pictureId: z.string(),
      allergens: z
        .array(
          z.object({
            id: z.string().or(z.number()),
            name: z.string().optional(),
            icon: z.string().optional()
          })
        )
        .optional()
    }),
    res: z.object({
      id: z.bigint(),
      name: z.string(),
      description: z.string(),
      price: z.number(),
      pictureId: z.string(),
      allergens: z
        .array(
          z.object({
            id: z.bigint(),
            name: z.string(),
            icon: z.string(),
            createdAt: z.date(),
            updatedAt: z.date()
          })
        )
        .optional(),
      createdAt: z.date(),
      updatedAt: z.date()
    })
  }
};

// POST /api/v1/food
export const post = async (
  req: Request,
  res: Response<z.infer<typeof schemas.post.res>>
) => {
  try {
    const db = (await orm).em.fork();
    const { name, description, price, pictureId, allergens } = req.body;

    // Új étel létrehozása
    const food = new Food();
    food.name = name;
    food.description = description;
    food.price = price;
    food.pictureId = pictureId;

    // Allergének hozzárendelése (ha vannak)
    if (allergens && allergens.length > 0) {
      for (const allergenData of allergens) {
        const allergen = await db.findOne(Allergen, {
          id: BigInt(allergenData)
        });

        if (allergen) {
          food.allergens.add(allergen);
        }
      }
    }

    await db.persistAndFlush(food);
    await food.allergens.init();

    return res.status(Status.Ok).json({
      id: food.id,
      name: food.name,
      description: food.description,
      price: food.price,
      pictureId: food.pictureId,
      allergens: food.allergens.getItems(),
      createdAt: food.createdAt,
      updatedAt: food.updatedAt
    });
  } catch (err: any) {
    console.error('POST /food error:', err);
    return res.error(Status.InternalServerError, err.message);
  }
};
