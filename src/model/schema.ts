import { Schema, model } from 'mongoose';

const { ObjectId, Decimal128 } = Schema.Types;

const entrySchema = new Schema({
  comments: String,
  target: { type: String, require: true },
  timestamp: { type: Date, require: true },
  type: { type: String, require: true },
  value: { type: Decimal128, require: true },
  isExpense: { type: Boolean, require: true },
});
export const Entry = model('Entry', entrySchema, 'entries');

const debtSchema = new Schema({
  type: { type: String, required: true },
  value: { type: Decimal128, required: true },
  dueDate: { type: Date, required: true },
});
export const Debt = model('Debt', debtSchema);

const accountSchema: Schema = new Schema({
  name: { type: String, required: true },
  value: { type: Decimal128, required: true },
  isNegative: { type: Boolean, required: true },
});

const titleSchema: Schema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  value: { type: Decimal128, required: true },
});

const userSchema = new Schema({
  googleId: { type: String, required: true, unique: true },
  name: String,
  familyName: String,
  givenName: String,
  picture: String,
  email: String,
  createdAt: { type: Date, default: Date.now() },
  accounts: [accountSchema],
  titles: [titleSchema],
  debts: [ObjectId],
  entries: [ObjectId],
});

export const User = model('User', userSchema);
