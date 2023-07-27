import { Credentials, OAuth2Client } from 'google-auth-library';
import { env } from 'process';
import { ErrorObject, Message } from '../model';
import { upsertUserWithGooglePayload } from './user.service';

export function getGoogleConsentUrl() {
  const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URL } = env;
  const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
  const scopes = ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'];
  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
    include_granted_scopes: true,
  });

  return url;
}

export async function refreshSessionWithGoogle(code: string, sessionId: string) {
  const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URL } = env;
  const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
  let tokens: Credentials = {};
  tokens = (await client.getToken(code)).tokens;

  const { id_token } = tokens;

  if (!id_token) {
    const error = new ErrorObject(400, Message.NoIdToken, true);
    throw error;
  }

  const ticket = await client.verifyIdToken({ idToken: id_token, audience: CLIENT_ID });
  const payload = ticket.getPayload();

  if (!payload) {
    const error = new ErrorObject(400, Message.TokenWithoutInfo, true);
    throw error;
  }

  try {
    await upsertUserWithGooglePayload(payload, tokens, sessionId);
  } catch (error) {
    console.log(error);
  }
}
