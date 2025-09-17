import { Options, MariaDbDriver } from '@mikro-orm/mariadb';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';

const config: Options = {
  driver: MariaDbDriver,
  dbName: process.env.DB_NAME!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASS!,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  metadataProvider: TsMorphMetadataProvider,
  debug: true
};

export default config;
