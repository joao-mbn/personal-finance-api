import { Schema, model } from 'mongoose';

const { ObjectId, Decimal128, Mixed } = Schema.Types;

const entrySchema = new Schema({
  id: ObjectId,
  comments: String,
  target: String,
  timestamp: Date,
  type: String,
  value: Decimal128,
  isExpense: Mixed,
});

export const Entry = model('Entry', entrySchema, 'entries');
