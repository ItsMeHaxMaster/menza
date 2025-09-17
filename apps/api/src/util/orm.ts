import { MikroORM } from '@mikro-orm/mariadb';

import config from '@/mikro-orm.config.js';

const orm = (async () => await MikroORM.init(config))();

export { orm };

/*
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  connectTimeout: 1000
*/
