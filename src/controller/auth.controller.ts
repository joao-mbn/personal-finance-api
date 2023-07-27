import { CookieOptions, Request, Response, Router } from 'express';
import { env } from 'process';
import { getGoogleConsentUrl, refreshSessionWithGoogle } from '../service/auth.service';

export const router = Router();

router.get('/ping', (_, response: Response) => {
  response.status(200).send('OK!');
});

router.get('/getGoogleConsentUrl', (_, response: Response) => {
  const url = getGoogleConsentUrl();
  response.send(url);
});

router.get('/google', async (request: Request, response: Response) => {
  const {
    query: { code },
    session: { id: sessionId },
  } = request;
  const { ORIGIN } = env;

  await refreshSessionWithGoogle(code as string, sessionId);

  response.cookie('sessionId', sessionId, request.session.cookie as CookieOptions);
  ORIGIN && response.redirect(ORIGIN);
});
