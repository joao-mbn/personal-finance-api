import { Request, Response, Router } from 'express';
import { asyncHandler } from '../core/asyncHandler';
import { DateRangeRequest, IEntry, WithRequired } from '../model';
import { createOne, deleteOne, getMany, updateOne } from '../service/register.service';
import { getUserFromRequest } from '../service/user.service';

export const router = Router();

router.get(
  '/',
  asyncHandler(async (request: Request<unknown, unknown, unknown, DateRangeRequest>, response) => {
    const { id: userId } = getUserFromRequest(request);

    const registersWithOptions = await getMany(request.query, userId);
    response.send(registersWithOptions);
  })
);

router.post(
  '/',
  asyncHandler(
    async (
      request: Request<{ id: string }, unknown, WithRequired<IEntry, 'id'>, DateRangeRequest>,
      response: Response
    ) => {
      const { id: userId } = getUserFromRequest(request);

      const newEntry = await createOne(request.body, userId);
      response.send(newEntry);
    }
  )
);

router.post(
  '/:id',
  asyncHandler(
    async (
      request: Request<{ id: string }, unknown, WithRequired<IEntry, 'id'>, DateRangeRequest>,
      response: Response
    ) => {
      const { id: userId } = getUserFromRequest(request);

      const newEntry = await updateOne(request.body, userId);
      response.send(newEntry);
    }
  )
);

router.delete(
  '/:id',
  asyncHandler(async (request: Request<{ id: string }, unknown, unknown, unknown>, response: Response) => {
    const { id: userId } = getUserFromRequest(request);
    const { id: entryId } = request.params;

    const deletedEntryId = await deleteOne(entryId, userId);
    response.send(deletedEntryId);
  })
);
