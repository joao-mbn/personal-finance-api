import axios from 'axios';
import { env } from 'process';
import { GoogleTokensResponse } from '../model';

export function refreshGoogleToken(refreshToken: string) {
  const { CLIENT_ID, CLIENT_SECRET } = env;
  return axios.post<GoogleTokensResponse>(
    'https://oauth2.googleapis.com/token',
    {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    },
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
}

export function revokeGoogleToken(token: string) {
  // Not need in the auth flow. Will be used on account deletion.
  return axios.post<{}>('https://oauth2.googleapis.com/revoke', null, {
    params: { token }, // can be either refresh or access token.
    responseEncoding: 'utf8',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
}
