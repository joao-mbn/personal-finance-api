import { RequestHandler } from 'express';
import * as core from 'express-serve-static-core';

export function asyncHandler<P = core.ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = core.Query>(
  fn: RequestHandler<P, ResBody, ReqBody, ReqQuery>
) {
  function wrapper(...args: Parameters<RequestHandler<P, ResBody, ReqBody, ReqQuery>>) {
    const [request, response, next] = args;
    return Promise.resolve(fn(request, response, next)).catch(next);
  }
  return wrapper;
}
