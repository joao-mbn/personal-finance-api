import { NextFunction, Request, Response } from 'express';
import { ErrorObject, Message, User } from '../../model';
import { refreshGoogleToken, removeTokenAndSessionById, updateSessionExpiryDateById } from '../../service';
import { parseCookieString } from '../../utils';

const sessionFreeEndpoints = ['/auth/getGoogleConsentUrl', '/auth/google'];

export async function sessionValidator(request: Request, response: Response, next: NextFunction) {
  if (sessionFreeEndpoints.includes(request.path)) {
    return next();
  }

  const sessionId = parseCookieString(request.headers.cookie)['sessionId'] as string;

  if (!sessionId) {
    const error = new ErrorObject(401, Message.NoSessionId);
    return next(error);
  }

  const user = await User.findOne({ sessionId });
  if (!user) {
    const error = new ErrorObject(404, Message.InvalidSessionId);
    return next(error);
  }

  const { refreshToken, sessionExpiryDate, _id } = user;
  const sessionExpired = (sessionExpiryDate ?? 0) > new Date();

  if (!sessionExpired) {
    await updateSessionExpiryDateById(_id);
    return next();
  }

  if (!refreshToken) {
    const error = new ErrorObject(400, Message.SessionExpired);
    return next(error);
  }

  try {
    await refreshGoogleToken(refreshToken);
  } catch (error) {
    removeTokenAndSessionById(_id);
    return next(error);
  }

  await updateSessionExpiryDateById(_id);
  next();
}
