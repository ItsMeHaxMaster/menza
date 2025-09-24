import Status from '@/enum/status';

import { Request, Response } from '@/util/handler';
import { verify } from '@/util/turnstile';
import { orm } from '@/util/orm';

import { User } from '@/entities/user.entity';

import { z } from 'zod';
import bcrypt from 'bcrypt';
import { sign } from 'jsonwebtoken';

export const schemas = {
  post: {
    res: z.object({
      jwt: z.string(),
      expires: z.date()
    }),
    req: z.object({
      email: z.string().email(),
      password: z.string().max(256),
      turnstile: z.string()
    })
  }
};

export const post = async (
  req: Request,
  res: Response<z.infer<typeof schemas.post.res>>
) => {
  const db = (await orm).em.fork();

  try {
    const { email, password, turnstile } = req.validateBody(schemas.post.req);

    if (!(await verify(turnstile, req.ip)))
      return res.error(Status.Forbidden, 'Captcha failed.');

    const user = await db.findOne(User, { email });
    if (!user)
      return res.error(
        Status.Forbidden,
        'Either the email or password was wrong.'
      );

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.error(
        Status.Forbidden,
        'Either the email or password was wrong.'
      );

    const token = sign(
      {
        id: user.id.toString(),
        email: user.email,
        name: user.name
      },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );

    return res.status(Status.Ok).send({
      jwt: token,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    });
  } catch (e: any) {
    if (e.name === 'ValidationError')
      return res.error(
        Status.BadRequest,
        'The request body was malformed, required fields: `email`, `password` and `turnstile`.'
      );

    return res.error(Status.InternalServerError, 'Internal Server Error');
  }
};
