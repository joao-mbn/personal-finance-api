import { IUser } from '../../model';

declare module 'express-serve-static-core' {
  interface Request {
    user?: IUser | null;
  }
}
