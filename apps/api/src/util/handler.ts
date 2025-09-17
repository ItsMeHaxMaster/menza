import Status from '@/enum/status';
import Method from '@/enum/method';

import { ValidationError } from '@/util/errors';

import { CookieOptions, RequestFile } from '@/interfaces';

import { ZodObject } from 'zod';

/**
 * Request class to handle incoming requests.
 *
 * @class Request
 */
export class Request {
  public method: Method;
  public headers: { [key: string]: string };
  public query: { [key: string]: string | number };
  public body: { [key: string]: any };
  public files: RequestFile[];
  public params: { [key: string]: string | number };
  public cookies: { [key: string]: string | number };
  public ip: string;

  /**
   * Implement a method instead of using this!
   * This is only public for testing purposes.
   */
  public req: any;

  private res: Response<unknown> | undefined;

  constructor(req: any, res: Response<unknown> | undefined) {
    this.method = req.method;
    this.headers = req.headers;

    this.query = req.query;
    this.body = req.body;
    this.files = req.files;
    this.params = req.params;
    this.cookies = req.cookies;

    this.ip =
      req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.ip;

    this.req = req;
    this.res = res;
  }

  /**
   * Get a header from the request.
   *
   * @param key The header's name.
   *
   * @returns The header's value.
   */
  public getHeader(key: string): string | undefined {
    return this.headers[key.toLowerCase()];
  }

  /**
   * Get a route parameter from the request.
   *
   * @param key The parameter's name.
   *
   * @returns The parameter's value.
   */
  public getParam(key: string): string | number | undefined {
    return this.params[key.toLowerCase()];
  }

  /**
   * Get a query parameter from the request.
   *
   * @param key The parameter's name.
   *
   * @returns The parameter's value.
   */
  public getQuery(key: string): string | number | undefined {
    return this.query[key.toLowerCase()];
  }

  /**
   * Get a cookie from the request.
   *
   * @param key The cookie's name.
   *
   * @returns The cookie's value.
   */
  public getCookie(key: string): string | number | undefined {
    return this.cookies[key.toLowerCase()];
  }

  public validate<T extends ZodObject<any>>(schema: T): T['_output'] {
    if (!this.res) new Error();
    const res = schema.safeParse(this.req.body);

    if (!res.success) {
      const issues = res.error.issues;
      const missingFields: string[] = [];
      const malformedFields: { name: string; type: string }[] = [];

      issues.forEach((issue) => {
        if (issue.code === 'invalid_type' && issue.received === 'undefined')
          missingFields.push(issue.path.join('.'));
        if (issue.code === 'invalid_string')
          malformedFields.push({
            name: issue.path.join('.'),
            type: issue.validation as string
          });
      });

      if (missingFields.length > 0) {
        if (missingFields.length === 1) {
          this.res!.error(
            Status.BadRequest,
            `error.generic.fieldMissing;("${missingFields[0]}")`
          );
        } else {
          this.res!.error(
            Status.BadRequest,
            `error.generic.fieldsMissing;("${missingFields.join('","')}")`
          );
        }
      } else if (malformedFields.length > 0) {
        this.res!.error(
          Status.BadRequest,
          `error.generic.fieldMalformed;("${malformedFields[0].name}","${malformedFields[0].type}")`
        );
      }

      throw new ValidationError(issues);
    }

    return res.data;
  }
}

/**
 * Response class to handle outgoing responses.
 *
 * @class Response
 * @template T The type of the response data.
 */
export class Response<T> {
  /**
   * Implement a method instead of using this!
   * This is only public for testing purposes.
   */
  public res: any;

  private req: any;

  constructor(res: any, req: any) {
    this.res = res;

    this.req = req;
  }

  /**
   * Check if the request method is allowed.
   *
   * @param methods The allowed methods.
   * @returns True if the method is allowed, false otherwise.
   * @example
   * ```ts
   * if (!res.allow([Method.Get, Method.Post])) return;
   * ```
   *
   * @deprecated Use the appropriate named exports.
   */
  public allow(methods: Method[]): boolean {
    if (!methods.includes(this.req.method)) {
      this.res.set('Allow', methods.join(', ').toUpperCase());
      this.error(
        Status.MethodNotAllowed,
        `Only ${methods.join(', ')} method(s) are allowed.)`
      );

      return false;
    }

    return true;
  }

  /**
   * Create a cookie.
   *
   * @param key The name of the cookie.
   * @param value The value of the cookie.
   * @param options The options for the cookie.
   */
  public cookie(key: string, value: string, options?: CookieOptions) {
    this.res.cookie(key.toLowerCase(), value, options);
  }

  /**
   * Redirect the request to a different URL.
   *
   * @param url The URL to redirect to.
   * @param code The status code to use for the redirect.
   */
  public redirect(url: string, code: Status = Status.Found) {
    this.res.redirect(code, url);
  }

  /**
   * Set the status code of the response.
   *
   * @param code The status code.
   * @returns An object with methods to send the response.
   * @example
   * ```ts
   * res.status(Status.Ok).json({ message: 'Hello World' });
   * ```
   */
  public status(code: Status) {
    return {
      /**
       * A JSON response.
       *
       * @param data The data to send.
       */
      json: (data?: T) => {
        this.res.status(code).json(data);
      },
      /**
       * A text response.
       *
       * @param data The data to send.
       */
      send: (data?: T) => {
        this.res.type('txt').status(code).send(data);
      },
      /**
       * Set the content type of the response.
       *
       * @param type The content type.
       */
      type: (type: string) => {
        return {
          /**
           * Send the response.
           *
           * @param data The data to send.
           */
          send: (data?: T) => {
            this.res.type(type).status(code).send(data);
          }
        };
      },
      /**
       * Send an empty response.
       */
      end: () => {
        this.res.status(code).end();
      }
    };
  }

  /**
   * Send an error response.
   *
   * @param code The status code.
   * @param message The error message.
   */
  public error(code: Status, message: string) {
    return this.res.status(code).json({
      error: code,
      message
    });
  }
}
