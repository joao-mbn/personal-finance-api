import { Express, Request } from 'express';
import { ObjectId } from 'mongodb';
import { DateRangeRequest, Entry, IEntry, Message, User } from '../model';
import { dateRangeOrDefault } from '../utils';

export function loadRegistryController(app: Express) {
  const CONTROLLER = 'register';
  const USER_ID = '6449ca2830942603c86b90d2';

  interface Register extends IEntry {
    id: string;
  }

  app.get(`/${CONTROLLER}/getAll`, async (request: Request<unknown, unknown, unknown, DateRangeRequest>, response) => {
    const { startDate, endDate } = dateRangeOrDefault(request.query);
    const userId = USER_ID;

    const registers = await User.aggregate<Register>([
      { $match: { _id: new ObjectId(userId) } },
      {
        $lookup: {
          from: 'entries',
          localField: 'entries',
          foreignField: '_id',
          as: 'entries',
        },
      },
      { $unwind: '$entries' },
      { $match: { 'entries.timestamp': { $gte: startDate, $lte: endDate } } },
      {
        $project: {
          _id: 0,
          id: '$entries._id',
          timestamp: '$entries.timestamp',
          value: '$entries.value',
          target: '$entries.target',
          type: '$entries.type',
          comments: '$entries.comments',
        },
      },
      { $sort: { timestamp: -1 } },
    ]);

    const typeOptions = new Set<Required<IEntry['type']>>();
    const targetOptions = new Set<IEntry['target']>();

    registers.forEach(({ type, target }) => {
      type && typeOptions.add(type);
      targetOptions.add(target);
    });

    response.send({ registers, typeOptions: [...typeOptions], targetOptions: [...targetOptions] });
  });

  app.post(`/${CONTROLLER}/edit`, async (request: Request<unknown, unknown, IEntry, DateRangeRequest>, response) => {
    const { body } = request;
    const userId = USER_ID;
    const entryId = new ObjectId(body.id);

    const entryBelongsToUser = (
      await User.aggregate<{ hasEntry: boolean }>([
        { $match: { _id: new ObjectId(userId) } },
        { $project: { hasEntry: { $in: [entryId, '$entries'] } } },
      ])
    )[0]?.hasEntry;

    if (!entryBelongsToUser) {
      return response.status(401).send(Message.EditingNotAllowedEntry);
    }

    const newEntry = await Entry.findOneAndReplace<IEntry>({ _id: entryId }, body, {
      returnDocument: 'after',
      lean: true,
    });

    if (newEntry == null) {
      return response.status(500).send(Message.EntryWasNotCreated);
    }

    const { _id, ...rest } = newEntry;
    response.send({ ...rest, id: _id });
  });
}
