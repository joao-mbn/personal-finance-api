import { Express, Request } from 'express';
import { ObjectId } from 'mongodb';
import { DateRangeRequest, Entry, IEntry, Message, User } from '../model';
import { dateRangeOrDefault } from '../utils';

export function loadRegistryController(app: Express) {
  const CONTROLLER = 'register';
  const USER_ID = '6449ca2830942603c86b90d2';

  app.get(`/${CONTROLLER}/getAll`, async (request: Request<unknown, unknown, unknown, DateRangeRequest>, response) => {
    const registersWithOptions = await getRegistersWithOptions(request.query);
    response.send(registersWithOptions);
  });

  app.post(`/${CONTROLLER}/edit`, async (request: Request<unknown, unknown, IEntry, DateRangeRequest>, response) => {
    const { query, body } = request;
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

    await Entry.findOneAndReplace({ _id: entryId }, body);

    const registersWithOptions = await getRegistersWithOptions(query);
    response.send(registersWithOptions);
  });

  async function getRegistersWithOptions(dateRange: DateRangeRequest) {
    const { startDate, endDate } = dateRangeOrDefault(dateRange);
    const userId = USER_ID;

    const registers = await User.aggregate<IEntry>([
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

    return { registers, typeOptions: [...typeOptions], targetOptions: [...targetOptions] };
  }
}
