import * as cors from 'cors';
import { randomUUID } from 'crypto';
import * as express from 'express';
import { Express } from 'express';
import * as session from 'express-session';
import { env } from 'process';
import { serve, setup } from 'swagger-ui-express';
import { loadAuthController, loadDashboardController } from '../controller';
import { errorHandler, sessionValidator } from './middleware';
import * as swaggerDocument from './swagger.json';

export function initApp() {
  const { PORT, ORIGIN, SESSION_SECRET } = env;

  /**
   * don't load a custom port into production,
   * as a named pipe will be given automatically.
   * Doing otherwise will crash the app.
   */
  const port = PORT || 5001;

  if (!SESSION_SECRET) {
    console.log('Startup failed: SESSION_SECRET is undefined.');
    return;
  }

  const app = express();
  app.use(cors({ credentials: true, origin: ORIGIN }));
  app.use(
    session({
      name: 'sessionId',
      secret: SESSION_SECRET,
      genid: () => randomUUID(),
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: false,
      },
    })
  );
  app.use(sessionValidator);
  app.use(express.json());
  app.use('/swagger', serve, setup(swaggerDocument));
  app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
  loadControllers(app);
  app.use(errorHandler);
}

function loadControllers(app: Express) {
  // TODO: use routers
  loadDashboardController(app);
  loadAuthController(app);
}
