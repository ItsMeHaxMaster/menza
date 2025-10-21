import { Request, Response } from '@/util/handler';
import Status from '@/enum/status';

export const get = async (req: Request, res: Response<any>) => {
  try {
    const user = await req.getUser();

    return res.status(Status.Ok).json({
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    });
  } catch (err) {
    return res.error(Status.Unauthorized, 'Unauthorized');
  }
};
