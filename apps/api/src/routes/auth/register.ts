import Status from '@/enum/status';

import { Request, Response } from '@/util/handler';
import { verify } from '@/util/turnstile';
import snowflake from '@/util/snowflake';
import { orm } from '@/util/orm';

import { User } from '@/entities/user.entity';

import { z } from 'zod';
import bcrypt from 'bcrypt';
import { sign } from 'jsonwebtoken';

interface RegRes {
  jwt: string;
  expires: Date;
}

const registerSchema = z.object({
  name: z.string().max(1024),
  email: z.string().email(),
  password: z.string().max(256),
  turnstile: z.string()
});

export const post = async (req: Request, res: Response<RegRes>) => {
  const db = (await orm).em;

  try {
    const { name, email, password, turnstile } = req.validate(registerSchema);

    if (!(await verify(turnstile, req.ip)))
      return res.error(Status.Forbidden, 'Captcha failed.');

    const saltedPassword = await bcrypt.hash(password, 10);
    const uid = snowflake.getUniqueID() as bigint;

    const userObject = new User();

    userObject.id = uid;
    userObject.name = name;
    userObject.email = email;
    userObject.password = saltedPassword;

    await db.persist(userObject).flush();

    const token = sign(
      {
        id: uid,
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
      return res.error(Status.BadRequest, 'NEM JÓ');

    return res.error(Status.InternalServerError, 'Internal Server Error');
  }
};
