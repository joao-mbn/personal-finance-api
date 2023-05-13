import { Credentials, TokenPayload } from 'google-auth-library';
import { User } from '../model';
import { TOKEN_LIFETIME } from '../utils';

export async function upsertUserWithGooglePayload(payload: TokenPayload, tokens: Credentials, sessionId: string) {
  const { sub: googleId, name, email, family_name: familyName, given_name: givenName, picture } = payload;
  const { refresh_token: refreshToken } = tokens;
  const user = await User.findOneAndUpdate(
    { googleId },
    {
      name,
      email,
      familyName,
      givenName,
      picture,
      sessionId,
      sessionExpiryDate: new Date(Date.now() + TOKEN_LIFETIME),
      refreshToken,
    },
    { new: true, upsert: true }
  );
  return user;
}

export async function updateSessionExpiryDateById(_id: string) {
  await User.findByIdAndUpdate(_id, { sessionExpiryDate: new Date(Date.now() + TOKEN_LIFETIME) }, { upsert: true });
}

export async function removeTokenAndSessionById(_id: string) {
  await User.findByIdAndUpdate(_id, { $unset: { refreshToken: '', sessionExpiryDate: '', sessionId: '' } });
}
