import { Schema, model } from 'mongoose';

const { ObjectId, Decimal128 } = Schema.Types;

const entrySchema = new Schema({
  _id: ObjectId,
  comments: String,
  target: { type: String, require: true },
  timestamp: { type: Date, require: true },
  type: { type: String, require: true },
  value: { type: Decimal128, require: true },
  isExpense: { type: Boolean, require: true },
});

export const Entry = model('Entry', entrySchema, 'entries');
