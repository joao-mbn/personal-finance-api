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
  comments: {
    type: String,
    maxlength: [
      REGISTER_COMMENT_MAX_LENGTH,
      `${Message.exceededMaxLength}|field:${Field.comment}|length:${REGISTER_COMMENT_MAX_LENGTH}`,
    ],
  },
  target: {
    type: String,
    required: [true, `${Message.isRequired}|field:${Field.target}`],
    minlength: [
      REGISTER_OPTION_MIN_LENGTH,
      `${Message.belowMinLength}|field:${Field.target}|length:${REGISTER_OPTION_MIN_LENGTH}`,
    ],
    maxlength: [
      REGISTER_OPTION_MAX_LENGTH,
      `${Message.exceededMaxLength}|field:${Field.target}|length:${REGISTER_OPTION_MAX_LENGTH}`,
    ],
  },
  timestamp: { type: Date, required: [true, `${Message.isRequired}|field:${Field.timestamp}`], default: Date.now },
  type: {
    type: String,
    maxlength: [
      REGISTER_OPTION_MAX_LENGTH,
      `${Message.exceededMaxLength}|field:${Field.type}|length:${REGISTER_OPTION_MAX_LENGTH}`,
    ],
  },
  value: {
    type: Number,
    required: [true, `${Message.isRequired}|field:${Field.value}`],
    validate: {
      validator: (value: number) => value !== 0,
      message: `${Message.cannotBeNullOrZero}|field:${Field.value}`,
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
