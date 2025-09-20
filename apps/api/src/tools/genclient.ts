import getRoutes from '@/util/get_routes';
import Logger from '@/util/logger';
import pathParser from '@/util/path_parser';

import path from 'node:path';

const logger = new Logger('tool::gen_client');

(async () => {
  logger.info('Generating client code...');

  const routes: string[] = await getRoutes(
    path.join(__dirname, '..', 'routes')
  );

  for (const route of routes) {
    try {
      const routePath = pathParser(
        route.replace(__dirname, '').replace(/\\/g, '/')
      );
      const routeHandler = await import(routePath);

      logger.info(routeHandler);
    } catch {
      logger.error('Invalid route:', route);
    }
  }
})();
