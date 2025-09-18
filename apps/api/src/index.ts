import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import chalk from 'chalk';
import cookies from 'cookie-parser';
import expressWs from 'express-ws';

import path from 'node:path';

import { Request, Response } from '@/util/handler';
import Logger from '@/util/logger';
import getRoutes from '@/util/get_routes';
import pathParser from '@/util/path_parser';
import version from '@/util/version';
import { orm } from '@/util/orm';

import Method from '@/enum/method';

const app = expressWs(express()).app;

const logger = new Logger('canteen::api::main');
const webLogger = new Logger('canteen::api::req');

const PORT = parseInt(process.env.PORT!) || 3001;

app.use((req, res, next) => {
  res.setHeader('X-Powered-By', `Canteen/${version}`);
  next();

  const ip = req.headers['x-forwarded-for'] || req.ip;
  webLogger.info(
    `${ip} "${req.method} ${req.path} HTTP/${req.httpVersion}" ${res.statusCode} ${res.getHeader('Content-Length') ? res.getHeader('Content-Length') : '0'} "${req.get('Referer') ? req.get('Referer') : '-'}" "${req.get('User-Agent')}"`
  );
});

app.use(
  cors({
    maxAge: 86400
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(multer().any());
app.use(cookies());

(async () => {
  const startTimestamp = Date.now();

  // Check if db is alive otherwise throw an error.
  const db = await orm;
  const { ok } = await db.checkConnection();
  if (!ok) throw new Error();
  await db.schema.updateSchema();

  const routes: string[] = await getRoutes(path.join(__dirname, 'routes'));

  logger.info('○ Routes:', routes.length);
  for (const route of routes) {
    const routePath = pathParser(
      route.replace(__dirname, '').replace(/\\/g, '/')
    );
    const routeHandler = await import(route);

    const methods = Object.keys(routeHandler)
      .filter((key) => key !== 'default')
      .map((m) => {
        if (m === 'get') return Method.Get;
        if (m === 'post') return Method.Post;
        if (m === 'put') return Method.Put;
        if (m === 'del') return Method.Delete;
        if (m === 'patch') return Method.Patch;
        if (m === 'options') return Method.Options;
        if (m === 'head') return Method.Head;
        if (m === 'ws') return Method.WebSocket;
      })
      .filter((key) => typeof key != 'undefined');
    const isValid = methods.length > 0;

    if (isValid) {
      logger.info(
        chalk.green('⦿'),
        `\`${routePath}\``,
        '(' + methods.join(', ') + ')'
      );

      if (methods.includes(Method.WebSocket)) {
        app.ws(routePath, (ws, req) => {
          const request = new Request(req, undefined);
          routeHandler.ws(ws, request);
        });
      }

      app.all(routePath, (req, res) => {
        try {
          const response = new Response(res, req);
          const request = new Request(req, response);

          if (!response.allow(methods)) return;
          switch (req.method) {
            case Method.Get:
              return routeHandler.get(request, response);
            case Method.Post:
              return routeHandler.post(request, response);
            case Method.Put:
              return routeHandler.put(request, response);
            case Method.Delete:
              return routeHandler.del(request, response);
            case Method.Patch:
              return routeHandler.patch(request, response);
            case Method.Options:
              return routeHandler.options(request, response);
            case Method.Head:
              return routeHandler.head(request, response);
            default:
              return routeHandler.get(request, response);
          }
        } catch (err: any) {
          webLogger.error(err.message);

          res.status(500).json({
            error: 500,
            message: 'Internal Server Error'
          });
        }
      });
    } else logger.info(chalk.red('⦿'), `\`${routePath}\``);
  }

  app.use((req, res) => {
    res.status(404).json({
      error: 404,
      message: 'Not Found'
    });
  });

  app.listen(PORT, () => {
    logger.info('○ Port:', PORT);
    logger.info('○ Startup:', Date.now() - startTimestamp, '(ms)');
  });
})().catch((err) => {
  if (!err['errors']) logger.error(err);
  else
    err['errors'].forEach((e: any) => {
      logger.error(e);
    });
});

// :3
// Override default toString()s to return stuff in a 'better' way.
(Date.prototype as any).toJSON = function () {
  return this.getTime();
};

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};
