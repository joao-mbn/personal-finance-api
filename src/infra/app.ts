import * as cors from 'cors';
import * as express from 'express';
import { Express } from 'express';
import { env } from 'process';
import { serve, setup } from 'swagger-ui-express';
import { loadAuthController, loadDashboardController } from '../controller';
import * as swaggerDocument from './swagger.json';

export function initApp() {
  const { PORT } = env;

  if (!PORT) {
    console.log('Startup failed: PORT is undefined.');
    return;
  }

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/swagger', serve, setup(swaggerDocument));
  app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}/swagger`));

  loadControllers(app);
}

function loadControllers(app: Express) {
  loadAuthController(app);
  loadDashboardController(app);
}
