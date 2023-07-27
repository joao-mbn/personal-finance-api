import { Request, Response, Router } from 'express';
import { DateRangeRequest, IEntry } from '../model';
import { edit, getAll } from '../service/register.service';

const USER_ID = '6449ca2830942603c86b90d2';
export const router = Router();

router.get('/getAll', async (request: Request<unknown, unknown, unknown, DateRangeRequest>, response) => {
  const userId = USER_ID;
  const registersWithOptions = await getAll(request.query, userId);
  response.send(registersWithOptions);
});

router.post('/edit', async (request: Request<unknown, unknown, IEntry, DateRangeRequest>, response: Response) => {
  const userId = USER_ID;
  const newEntry = await edit(request.body, userId);
  response.send(newEntry);
});
