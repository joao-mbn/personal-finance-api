import { NextFunction, Request, Response } from 'express';
import { ErrorObject } from '../../model';

export async function errorHandler(error: ErrorObject | unknown, _: Request, response: Response, next: NextFunction) {
  if (response.headersSent || !(error instanceof ErrorObject)) {
    return next(error);
  }

  const { code, message, asHTML } = error;
  if (asHTML) {
    const prettyMessage = message
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLocaleLowerCase())
      .join(' ');
    response.status(+code).send(`<h1>${code}: ${prettyMessage}</h1>`);
  } else {
    response.status(+code).send(message);
  }
}
