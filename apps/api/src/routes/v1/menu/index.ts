import Status from '@/enum/status';

import { Request, Response } from '@/util/handler';

import { z } from 'zod';

export const schemas = {
  get: {
    res: z.array(
      z.object({
        almafa: z.string()
      })
    )
  }
};

export const get = (
  req: Request,
  res: Response<z.infer<typeof schemas.get.res>>
) => {};
