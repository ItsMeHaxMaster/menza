import {
  Options,
  MariaDbDriver,
  DefaultLogger,
  LoggerNamespace,
  LogContext
} from '@mikro-orm/mariadb';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';

import Logger from '@/util/logger';

class CustomLogger extends DefaultLogger {
  log(namespace: LoggerNamespace, message: string, context?: LogContext) {
    const logger = new Logger(`canteen::api::orm::${namespace}`);
    // Create your own implementation for output:

    switch ((context || { level: 'info' }).level) {
      case 'info':
        logger.info(message);
        break;
      case 'error':
        logger.error(message);
        break;
      case 'warning':
        logger.warn(message);
        break;
    }
  }
}

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
  debug: true,
  loggerFactory: (options) => new CustomLogger(options),
  highlighter: new SqlHighlighter()
};

export default config;
