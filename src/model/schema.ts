import { ObjectId } from 'mongodb';
import { Document, Schema, Types, model } from 'mongoose';
import { Field, Message } from '.';
export interface IEntry {
  id?: string;
  comments?: string;
  target: string;
  timestamp: Date;
  type?: string;
  value: number;
}

const REGISTER_OPTION_MIN_LENGTH = 3;
const REGISTER_OPTION_MAX_LENGTH = 30;
const REGISTER_COMMENT_MAX_LENGTH = 200;

const entrySchema = new Schema<IEntry>({
  comments: { type: String, maxlength: [REGISTER_COMMENT_MAX_LENGTH, `${Field.Comment}|${Message.ExceededMaxLength}`] },
  target: {
    type: String,
    required: [true, `${Field.Target}|${Message.IsRequired}`],
    minlength: [REGISTER_OPTION_MIN_LENGTH, `${Field.Target}|${Message.BelowMinLength}`],
    maxlength: [REGISTER_OPTION_MAX_LENGTH, `${Field.Target}|${Message.ExceededMaxLength}`],
  },
  timestamp: { type: Date, required: [true, `${Field.Timestamp}|${Message.IsRequired}`], default: Date.now },
  type: { type: String, maxlength: [REGISTER_OPTION_MAX_LENGTH, `${Field.Type}|${Message.ExceededMaxLength}`] },
  value: {
    type: Number,
    required: [true, `${Field.Value}|${Message.IsRequired}`],
    validate: {
      validator: (value: number) => value !== 0,
      message: `${Field.Value}|${Message.CannotBeNullOrZero}`,
    },
  },
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

export interface IUser extends Document<ObjectId> {
  googleId: string;
  refreshToken?: string;
  sessionId?: Schema.Types.UUID;
  sessionExpiryDate?: Date;
  name?: string;
  familyName?: string;
  givenName?: string;
  picture?: string;
  email?: string;
  createdAt: Date;
  updatedAt?: Date;
  accounts: Types.DocumentArray<IAccount>;
  titles: Types.DocumentArray<ITitle>;
  debts: Types.Array<Types.ObjectId>;
  entries: Types.Array<Types.ObjectId>;
}

const userSchema = new Schema<IUser>(
  {
    googleId: { type: String, required: true, unique: true },
    refreshToken: String,
    sessionId: Schema.Types.UUID,
    sessionExpiryDate: Date,
    name: String,
    familyName: String,
    givenName: String,
    picture: String,
    email: String,
    accounts: [accountSchema],
    titles: [titleSchema],
    debts: [{ type: Schema.Types.ObjectId, ref: 'Debt' }],
    entries: [{ type: Schema.Types.ObjectId, ref: 'Entry' }],
  },
  { timestamps: true }
);

export const User = model<IUser>('User', userSchema);
