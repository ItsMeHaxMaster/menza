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
      name: z.string().max(1024),
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
    const { name, email, password, turnstile } = req.validate(schemas.post.req);

    if (!(await verify(turnstile, req.ip)))
      return res.error(Status.Forbidden, 'Captcha failed.');

    const saltedPassword = await bcrypt.hash(password, 10);

    const userObject = new User();

    userObject.name = name;
    userObject.email = email;
    userObject.password = saltedPassword;

    await db.persistAndFlush(userObject);

    const token = sign(
      {
        id: userObject.id.toString(),
        email: email,
        name: name
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
        'The request body was malformed, required fields: `name`, `email`, `password` and `turnstile`.'
      );
    if (e.name === 'UniqueConstraintViolationException')
      return res.error(
        Status.Conflict,
        'A user with this email already exists.'
      );

    return res.error(Status.InternalServerError, 'Internal Server Error');
  }
};
