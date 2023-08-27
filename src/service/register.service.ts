import { ObjectId } from 'mongodb';
import { DateRangeRequest, Entry, ErrorObject, IEntry, Message, Register, User, WithRequired } from '../model';
import { dateRangeOrDefault } from '../utils';

export async function getMany(dateRange: DateRangeRequest, userId: string) {
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

export async function createOne(entry: IEntry, userId: string) {
  const newEntryArray = await Entry.create<IEntry>([entry], {
    validateBeforeSave: true,
  });

  if (newEntryArray?.[0] == null) {
    const error = new ErrorObject(500, Message.EntryWasNotCreated);
    throw error;
  }
  const { _id, ...rest } = newEntryArray[0].toObject();

  const _userId = new ObjectId(userId);
  const { modifiedCount } = await User.updateOne({ _id: _userId }, { $push: { entries: _id } });

  if (modifiedCount === 0) {
    const error = new ErrorObject(500, Message.EntryWasNotAssociated);
    throw error;
  }

  return { id: _id, ...rest };
}

export async function updateOne(entry: WithRequired<IEntry, 'id'>, userId: string) {
  const entryId = new ObjectId(entry.id);

  await ensureEntryBelongsToUser(entryId, userId);

  const newEntry = await Entry.findOneAndReplace<IEntry & { _id: ObjectId }>({ _id: entryId }, entry, {
    new: true,
    lean: true,
    runValidators: true,
  });

  if (newEntry == null) {
    const error = new ErrorObject(500, Message.EntryWasNotUpdated);
    throw error;
  }

  const { _id, ...rest } = newEntry;
  return { id: _id, ...rest };
}

export async function deleteOne(entryId: string, userId: string) {
  const _entryId = new ObjectId(entryId);
  const _userId = new ObjectId(userId);

  await ensureEntryBelongsToUser(_entryId, _userId);

  const { deletedCount } = await Entry.deleteOne({ _id: _entryId });
  if (deletedCount === 0) {
    const error = new ErrorObject(500, Message.EntryWasNotDeleted);
    throw error;
  }

  await User.updateOne({ _id: _userId }, { $pull: { entries: _entryId } });

  return entryId;
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
    const error = new ErrorObject(401, Message.EditingNotAllowedEntry);
    throw error;
  }
}
