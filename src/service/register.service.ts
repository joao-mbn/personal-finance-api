import { ObjectId } from 'mongodb';
import { DateRangeRequest, Entry, ErrorObject, IEntry, Message, Register, User } from '../model';
import { dateRangeOrDefault } from '../utils';

export async function getAll(dateRange: DateRangeRequest, userId: string) {
  const { startDate, endDate } = dateRangeOrDefault(dateRange);
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

  return { registers, typeOptions: [...typeOptions], targetOptions: [...targetOptions] };
}

export async function edit(entry: IEntry, userId: string) {
  const entryId = new ObjectId(entry.id);

  await ensureEntryBelongsToUser(entryId, userId);

  const newEntry = await Entry.findOneAndReplace<IEntry>({ _id: entryId }, entry, {
    returnDocument: 'after',
    lean: true,
    runValidators: true,
  });

  if (newEntry == null) {
    const error = new ErrorObject(500, Message.EntryWasNotCreated, true);
    throw error;
  }

  const { _id, ...rest } = newEntry;
  return { ...rest, id: _id };
}

async function ensureEntryBelongsToUser(entryId: string | ObjectId, userId: string | ObjectId) {
  const _entryId = entryId instanceof ObjectId ? entryId : new ObjectId(entryId);
  const _userId = userId instanceof ObjectId ? userId : new ObjectId(userId);

  const entryBelongsToUser = (
    await User.aggregate<{ hasEntry: boolean }>([
      { $match: { _id: _userId } },
      { $project: { hasEntry: { $in: [_entryId, '$entries'] } } },
    ])
  )[0]?.hasEntry;

  if (!entryBelongsToUser) {
    const error = new ErrorObject(401, Message.EditingNotAllowedEntry, true);
    throw error;
  }
}
