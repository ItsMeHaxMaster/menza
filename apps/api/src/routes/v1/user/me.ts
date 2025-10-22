import { Request, Response } from '@/util/handler';

import Status from '@/enum/status';

import { z } from 'zod';

export const schemas = {
  get: {
    res: z.object({
      id: z.string(),
      name: z.string(),
      email: z.string().email(),
      createdAt: z.date(),
      updatedAt: z.date()
    })
  }
};

export const get = async (
  req: Request,
  res: Response<z.infer<typeof schemas.get.res>>
) => {
  try {
    const user = await req.getUser();

    return res.status(Status.Ok).json({
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (err) {
    return res.error(Status.Unauthorized, 'Unauthorized');
  }
};
