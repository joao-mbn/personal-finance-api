import { Document, Schema, Types, model } from 'mongoose';

export interface IEntry extends Document {
  comments: string;
  target: string;
  timestamp: Date;
  type: string;
  value: number;
}

const entrySchema = new Schema<IEntry>({
  comments: String,
  target: { type: String, required: true },
  timestamp: { type: Date, required: true },
  type: { type: String, required: true },
  value: { type: Number, required: true },
});

export const Entry = model<IEntry>('Entry', entrySchema, 'entries');

export interface IDebt extends Document {
  name: string;
  value: number;
  dueDate: Date;
  isPaid: boolean;
}

const debtSchema = new Schema<IDebt>({
  name: { type: String, required: true },
  value: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  isPaid: { type: Boolean, required: true, default: false },
});

export const Debt = model<IDebt>('Debt', debtSchema);

export interface IAccount extends Document {
  name: string;
  value: number;
  isNegative: boolean;
}

const accountSchema = new Schema<IAccount>({
  name: { type: String, required: true },
  value: { type: Number, required: true },
});

export interface ITitle extends Document {
  name: string;
  type: string;
  value: number;
}

const titleSchema = new Schema<ITitle>({
  name: { type: String, required: true },
  type: { type: String, required: true },
  value: { type: Number, required: true },
});

export interface IUser extends Document {
  googleId: string;
  name?: string;
  familyName?: string;
  givenName?: string;
  picture?: string;
  email?: string;
  createdAt: Date;
  accounts: Types.DocumentArray<IAccount>;
  titles: Types.DocumentArray<ITitle>;
  debts: Types.Array<Types.ObjectId>;
  entries: Types.Array<Types.ObjectId>;
}

const userSchema = new Schema<IUser>({
  googleId: { type: String, required: true, unique: true },
  name: String,
  familyName: String,
  givenName: String,
  picture: String,
  email: String,
  createdAt: { type: Date, default: Date.now() },
  accounts: [accountSchema],
  titles: [titleSchema],
  debts: [{ type: Schema.Types.ObjectId, ref: 'Debt' }],
  entries: [{ type: Schema.Types.ObjectId, ref: 'Entry' }],
});

export const User = model<IUser>('User', userSchema);
