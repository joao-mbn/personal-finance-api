import { Express } from 'express';
import { Entry } from '../model/entry';

export function loadEntryController(app: Express) {
  const CONTROLLER = 'entry';

  app.get(`/${CONTROLLER}/getAll`, async (_, response) => {
    const entries = (await Entry.find()).map(({ _id, comments, isExpense, target, timestamp, type, value }) => ({
      id: _id,
      type,
      target,
      value: isExpense ? -Number(value) : Number(value),
      comments,
      timestamp,
    }));
    response.send(entries);
  });
}
