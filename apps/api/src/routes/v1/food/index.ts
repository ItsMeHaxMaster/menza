import { Request, Response } from '@/util/handler';
import Status from '@/enum/status';
import { z } from 'zod';
import { orm } from '@/util/orm';
import { Food } from '@/entities/food.entity';
import { Allergen } from '@/entities/allergen.entity';
import sharp from 'sharp';
import * as crypto from 'node:crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Initialize S3 client
const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT!,
  region: process.env.S3_REGION!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!
  }
});

export const schemas = {
  get: {
    res: z.array(
      z.object({
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
    )
  },
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
  }
};

// GET /api/v1/food - Get all foods
export const get = async (
  req: Request,
  res: Response<z.infer<typeof schemas.get.res>>
) => {
  const db = (await orm).em.fork();

  try {
    // Get all foods from database with allergens populated
    const foods = await db.find(Food, {}, { populate: ['allergens'] });

    // Map to response format
    const foodsResponse = foods.map((food) => ({
      id: food.id,
      name: food.name,
      description: food.description,
      price: food.price,
      pictureId: food.pictureId || '',
      allergens: food.allergens.getItems(),
      createdAt: food.createdAt,
      updatedAt: food.updatedAt
    }));

    res.status(Status.Ok).json(foodsResponse);
  } catch (e: unknown) {
    console.error(e);
    res.error(Status.InternalServerError, 'Internal Server Error');
  }
};

// POST /api/v1/food - Create new food
export const post = async (
  req: Request,
  res: Response<z.infer<typeof schemas.post.res>>
) => {
  const db = (await orm).em.fork();

  try {
    const contentType = req.getHeader('Content-Type');
    let data = req.body;
    let fName: string | undefined;
    let fHash: string | undefined;
    let fBuffer: Buffer | undefined;

    if (contentType!.includes('multipart/form-data')) {
      const file = req.files[0];
      data = JSON.parse(req.body.data);

      if (!file)
        return res.error(
          Status.BadRequest,
          'No file provided on the file field.'
        );

      fBuffer = await sharp(file.buffer).webp({ quality: 80 }).toBuffer();
      fHash = crypto.createHash('sha1').update(file.originalname).digest('hex');
      fName = `${fHash}.webp`;
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

    if (fBuffer && fName && fHash) {
      const s3Key = `food/${food.id}/${fName}`;
      const uploadCommand = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: s3Key,
        Body: fBuffer,
        ContentType: 'image/webp',
        ACL: 'public-read'
      });

      await s3Client.send(uploadCommand);

      food.pictureId = fHash;
    }

    await db.persistAndFlush(food);
    await food.allergens.init();

    return res.status(Status.Ok).json({
      id: food.id,
      name: food.name,
      description: food.description,
      price: food.price,
      pictureId: food.pictureId || '',
      allergens: food.allergens.getItems(),
      createdAt: food.createdAt,
      updatedAt: food.updatedAt
    });
  } catch (e: any) {
    console.error(e);
    return res.error(Status.InternalServerError, 'Internal Server Error');
  }
};
