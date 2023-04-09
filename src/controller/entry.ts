import { Express } from 'express';
import { Entry } from '../model/entry';

export function loadEntryController(app: Express) {
  const CONTROLLER = 'entry';

  app.get(`/${CONTROLLER}/getAll`, async (_, response) => {
    const entries = await Entry.find();
    response.send(entries);
  });
}
