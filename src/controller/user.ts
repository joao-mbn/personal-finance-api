import { TokenPayload } from 'google-auth-library';
import { User } from '../model';

export async function upsertUserWithGooglePayload(payload: TokenPayload) {
  const { sub: googleId, name, email, family_name: familyName, given_name: givenName, picture } = payload;
  const user = await User.findOneAndUpdate(
    { googleId },
    { name, email, familyName, givenName, picture },
    { new: true, upsert: true }
  );
  return user;
}
