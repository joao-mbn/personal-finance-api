import { Express, Request } from 'express';
import { OAuth2Client } from 'google-auth-library';

export function loadAuthController(app: Express) {
  const CONTROLLER = 'auth';
  const FRONT_END_CLIENT_ID = '236640184219-nit4slkj0p939qkmuj67c1kdl8mqq9a0.apps.googleusercontent.com';

  app.post(`/${CONTROLLER}/google`, async (request: Request<{}, {}, { tokenId: string }>, response) => {
    const client = new OAuth2Client(FRONT_END_CLIENT_ID);
    async function verify() {
      const ticket = await client.verifyIdToken({
        idToken: request.body.tokenId,
        audience: FRONT_END_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const userid = payload?.['sub'];
    }
    verify().catch(console.error);
  });
}
