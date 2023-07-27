import { NextFunction, Request, Response } from 'express';
import { Error } from 'mongoose';
import { ErrorObject } from '../model';

export async function errorHandler(error: unknown, _: Request, response: Response, next: NextFunction) {
  if (response.headersSent) return next(error);

  if (error instanceof Error.ValidationError) {
    return response.status(400).send(Object.values(error.errors)[0].message);
  }

  if (error instanceof ErrorObject) {
    const { code, message, asHTML } = error;
    if (asHTML) {
      const prettyMessage = message
        .split('_')
        .map(word => word.charAt(0) + word.slice(1).toLocaleLowerCase())
        .join(' ');
      return response.status(+code).send(`<h1>${code}: ${prettyMessage}</h1>`);
    } else {
      return response.status(+code).send(message);
    }
  }

  return next(error);
}
