import { Request, Response } from '@/util/handler';
import Status from '@/enum/status';
import { z } from 'zod';
import { orm } from '@/util/orm';
import { Food } from '@/entities/food.entity';
import { Allergen } from '@/entities/allergen.entity';
import sharp from 'sharp';

export const schemas = {
  post: {
    req: z.object({
      name: z.string(),
      description: z.string(),
      price: z.number(),
      allergens: z
        .array(z.string().transform((id: string) => BigInt(id)))
        .optional()
    }),
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
    req: z.object({
      id: z.string().transform((id: string) => BigInt(id))
    }),
    res: z.object({
      success: z.boolean(),
      message: z.string()
    })
  }
};

// POST /api/v1/food
export const post = async (
  req: Request,
  res: Response<z.infer<typeof schemas.post.res>>
) => {
  const db = (await orm).em.fork();

  try {
    const contentType = req.getHeader('Content-Type');
    let data = req.body;

    if (contentType!.includes('multipart/form-data')) {
      const file = req.files[0];
      data = JSON.parse(req.body.data);

      if (!file)
        return res.error(
          Status.BadRequest,
          'No file provided on the file field.'
        );

      // convert the file to webp
      const webpBuffer = await sharp(file.buffer)
        .webp({ quality: 80 })
        .toBuffer();

      console.log(file, webpBuffer, data);

      return res.error(Status.InternalServerError, 'ANY');

      // TODO: IMPLEMENT FILE UPLOAD;
    }

    const { name, description, price, allergens } = req.validate(
      schemas.post.req,
      data
    );

    // Új étel létrehozása
    const food = new Food();
    food.name = name;
    food.description = description;
    food.price = price;

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

export const del = async (
  req: Request,
  res: Response<z.infer<typeof schemas.del.res>>
) => {
  const db = (await orm).em.fork();

  try {
    const { id } = req.validate(schemas.del.req, req.body);

    // Find the food item
    const food = await db.findOne(Food, { id }, { populate: ['allergens'] });

    if (!food) {
      return res.error(Status.NotFound, 'Food item not found');
    }

    // Remove the food item
    await db.removeAndFlush(food);

    return res.status(Status.Ok).json({
      success: true,
      message: 'Food item deleted successfully'
    });
  } catch (err: any) {
    console.error('DELETE /food error:', err);
    return res.error(Status.InternalServerError, err.message);
  }
};
