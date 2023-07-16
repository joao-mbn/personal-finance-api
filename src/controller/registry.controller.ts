import { Express, Request } from 'express';
import { ObjectId } from 'mongodb';
import { DateRangeRequest, User } from '../model';
import { dateRangeOrDefault } from '../utils';

export function loadRegistryController(app: Express) {
  const CONTROLLER = 'registry';
  const USER_ID = '6449ca2830942603c86b90d2';

  app.get(`/${CONTROLLER}/getAll`, async (request: Request<unknown, unknown, unknown, DateRangeRequest>, response) => {
    const { startDate, endDate } = dateRangeOrDefault(request.query);

    const userId = USER_ID;

    const balancesByMonth = await User.aggregate<{ _id: string; earnings: number; expenses: number; balance: number }>([
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

    response.send(balancesByMonth);
  });
}
