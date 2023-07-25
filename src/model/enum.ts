export enum DashboardWidget {
  Balances = 1,
  Debts = 2,
  DueSoonBills = 3,
  MonthlyEntries = 4,
  MonthlyBalance = 5,
  Assets = 6,
  MonthlyDebts = 7,
}

export enum Message {
  EditingNotAllowedEntry = 'EDITING_NOT_ALLOWED_ENTRY',
  EntryWasNotCreated = 'ENTRY_WAS_NOT_CREATED',
  ExceededMaxLength = 'EXCEEDED_MAX_LENGTH',
  BelowMinLength = 'BELOW_MIN_LENGTH',
  IsRequired = 'IS_REQUIRED',
  CannotBeNullOrZero = 'CANNOT_BE_NULL_OR_ZERO',
  InvalidSessionId = 'INVALID_SESSION_ID',
  NoIdToken = 'NO_ID_TOKEN',
  NoSessionId = 'NO_SESSION_ID',
  SessionExpired = 'SESSION_EXPIRED',
  TokenWithoutInfo = 'TOKEN_WITHOUT_INFO',
}

export enum Field {
  Target = 'TARGET',
  Comment = 'COMMENT',
  Type = 'TYPE',
  Value = 'VALUE',
  Timestamp = 'TIMESTAMP',
}
