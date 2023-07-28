import { Request, Response, Router } from 'express';
import { asyncHandler } from '../core/asyncHandler';
import { DateRangeRequest, IEntry } from '../model';
import { edit, getAll } from '../service/register.service';
import { getUserFromRequest } from '../service/user.service';

export const router = Router();

router.get(
  '/getAll',
  asyncHandler(async (request: Request<unknown, unknown, unknown, DateRangeRequest>, response) => {
    const { id } = getUserFromRequest(request);

    const registersWithOptions = await getAll(request.query, id);
    response.send(registersWithOptions);
  })
);

router.post(
  '/edit',
  asyncHandler(async (request: Request<unknown, unknown, IEntry, DateRangeRequest>, response: Response) => {
    const { id } = getUserFromRequest(request);

    const newEntry = await edit(request.body, id);
    response.send(newEntry);
  })
);
