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

  if (!PORT) {
    console.log('Startup failed: PORT is undefined.');
    return;
  }

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
  app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}/swagger`));
  loadControllers(app);
  app.use(errorHandler);
}

function loadControllers(app: Express) {
  loadDashboardController(app);
  loadAuthController(app);
}
