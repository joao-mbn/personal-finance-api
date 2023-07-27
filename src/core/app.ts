import * as cors from 'cors';
import { randomUUID } from 'crypto';
import * as express from 'express';
import { Express, json } from 'express';
import * as session from 'express-session';
import { env } from 'process';
import { serve, setup } from 'swagger-ui-express';
import { authRouter, dashboardRouter, registerRouter } from '../controller';
import { errorHandler, sessionValidator } from '../middleware';
import { asyncHandler } from './asyncHandler';
import * as swaggerDocument from './swagger.json';

export function initApp() {
  const app = express();

  loadMiddlewares(app);
  loadControllers(app);

  app.use(errorHandler); // Order matters. Error middleware should be last.

  /**
   * Don't load a custom port into production,
   * as a named pipe will be given automatically.
   * Doing otherwise will crash the app.
   */
  const port = env.PORT || 5001;
  app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
}

function loadMiddlewares(app: Express) {
  const { ORIGIN, SESSION_SECRET, ENVIRONMENT } = env;

  if (!SESSION_SECRET) {
    return console.log('Startup failed: SESSION_SECRET is undefined.');
  }

  app.use(json());
  app.use('/swagger', serve, setup(swaggerDocument));
  app.use(cors({ credentials: true, origin: ORIGIN }));
  const sessionOptions: session.SessionOptions = {
    name: 'sessionId',
    secret: SESSION_SECRET,
    genid: () => randomUUID(),
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: false },
  };
  if (ENVIRONMENT === 'production') {
    app.set('trust proxy', 1);
    sessionOptions.cookie!.secure = true;
    sessionOptions.cookie!.sameSite = 'none';
  }
  app.use(session(sessionOptions));
  app.use(asyncHandler(sessionValidator));
}

function loadControllers(app: Express) {
  app.use('/auth', authRouter);
  app.use('/dashboard', dashboardRouter);
  app.use('/register', registerRouter);
}
