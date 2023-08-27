import { NextFunction, Request, Response } from 'express';
import { ErrorObject, Message } from '../model';
import { refreshGoogleToken } from '../service/token.service';
import { getUserBySessionId, removeTokenAndSessionById, updateSessionExpiryDateById } from '../service/user.service';
import { parseCookieString } from '../utils';

const sessionFreeEndpoints = ['/auth/getGoogleConsentUrl', '/auth/google'];

export async function sessionValidator(request: Request, _: Response, next: NextFunction) {
  if (sessionFreeEndpoints.includes(request.path)) {
    return next();
  }

  const sessionId = parseCookieString(request.headers.cookie)['sessionId'] as string;

  if (!sessionId) {
    const error = new ErrorObject(401, Message.noSessionId);
    return next(error);
  }

  const user = await getUserBySessionId(sessionId);
  if (!user) {
    const error = new ErrorObject(404, Message.invalidSessionId);
    return next(error);
  }

  const { refreshToken, sessionExpiryDate, id } = user;

  const sessionExpired = (sessionExpiryDate ?? 0) > new Date();

  if (!sessionExpired) {
    request.user = await updateSessionExpiryDateById(id);
    return next();
  }

  if (!refreshToken) {
    const error = new ErrorObject(400, Message.sessionExpired);
    return next(error);
  }

  try {
    await refreshGoogleToken(refreshToken);
  } catch (error) {
    removeTokenAndSessionById(id);
    return next(error);
  }

  request.user = await updateSessionExpiryDateById(id);

  next();
}
