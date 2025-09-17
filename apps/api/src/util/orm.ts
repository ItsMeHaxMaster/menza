import { MikroORM } from '@mikro-orm/mariadb';

import config from '@/mikro-orm.config';

const orm = (async () => await MikroORM.init(config))();

export { orm };
