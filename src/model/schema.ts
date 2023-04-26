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

const userSchema = new Schema({
  googleId: { type: String, required: true, unique: true },
  name: String,
  familyName: String,
  givenName: String,
  picture: String,
  email: String,
  createdAt: { type: Date, default: Date.now() },
  accounts: [
    {
      Name: String,
      Value: Decimal128,
      isNegative: Boolean,
    },
  ],
  debts: [ObjectId],
  entries: [ObjectId],
});

export const User = model('User', userSchema);
