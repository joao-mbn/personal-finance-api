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
  AnErrorOccurred = 'AN_ERROR_OCCURRED',
  BelowMinLength = 'BELOW_MIN_LENGTH',
  CannotBeNullOrZero = 'CANNOT_BE_NULL_OR_ZERO',
  EditingNotAllowedEntry = 'EDITING_NOT_ALLOWED_ENTRY',
  EntryWasNotAssociated = 'ENTRY_WAS_NOT_ASSOCIATED',
  EntryWasNotCreated = 'ENTRY_WAS_NOT_CREATED',
  EntryWasNotDeleted = 'ENTRY_WAS_NOT_DELETED',
  EntryWasNotUpdated = 'ENTRY_WAS_NOT_UPDATED',
  ExceededMaxLength = 'EXCEEDED_MAX_LENGTH',
  InvalidSessionId = 'INVALID_SESSION_ID',
  IsRequired = 'IS_REQUIRED',
  NoIdToken = 'NO_ID_TOKEN',
  NoSessionId = 'NO_SESSION_ID',
  SessionExpired = 'SESSION_EXPIRED',
  TokenWithoutInfo = 'TOKEN_WITHOUT_INFO',
  UserNotFound = 'USER_NOT_FOUND',
}

export enum Field {
  Target = 'TARGET',
  Comment = 'COMMENT',
  Type = 'TYPE',
  Value = 'VALUE',
  Timestamp = 'TIMESTAMP',
}
