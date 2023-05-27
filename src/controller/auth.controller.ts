import { CookieOptions, Express, NextFunction, Request, Response } from 'express';
import { Credentials, OAuth2Client } from 'google-auth-library';
import { env } from 'process';
import { ErrorObject, Message } from '../model';
import { upsertUserWithGooglePayload } from '../service';

export function loadAuthController(app: Express) {
  const CONTROLLER = 'auth';
  const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URL, ORIGIN } = env;

  app.get(`/${CONTROLLER}/ping`, (_, response: Response) => {
    response.status(200).send('OK!');
  });

  app.get(`/${CONTROLLER}/getGoogleConsentUrl`, async (request: Request, response: Response) => {
    const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ];
    const url = client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      include_granted_scopes: true,
    });
    response.send(url);
  });

  app.get(`/${CONTROLLER}/google`, async (request: Request, response: Response, next: NextFunction) => {
    const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
    const { code } = request.query;

    let tokens: Credentials = {};
    try {
      tokens = (await client.getToken(code as string)).tokens;
    } catch (error) {
      return next(error);
    }

    const { id_token } = tokens;

    if (!id_token) {
      const error = new ErrorObject(400, Message.NoIdToken, true);
      return next(error);
    }

    try {
      const ticket = await client.verifyIdToken({ idToken: id_token, audience: CLIENT_ID });
      const payload = ticket.getPayload();

      if (!payload) {
        const error = new ErrorObject(400, Message.TokenWithoutInfo, true);
        return next(error);
      } else {
        const sessionId = request.session.id;
        await upsertUserWithGooglePayload(payload, tokens, sessionId);

        response.cookie('sessionId', sessionId, request.session.cookie as CookieOptions);
        ORIGIN && response.redirect(ORIGIN);
      }
    } catch (error) {
      next(error);
    }
  });
}
