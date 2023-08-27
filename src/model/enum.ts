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
  anErrorOccurred = 'anErrorOccurred',
  belowMinLength = 'belowMinLength',
  cannotBeNullOrZero = 'cannotBeNullOrZero',
  editingNotAllowedEntry = 'editingNotAllowedEntry',
  entryWasNotAssociated = 'entryWasNotAssociated',
  entryWasNotCreated = 'entryWasNotCreated',
  entryWasNotDeleted = 'entryWasNotDeleted',
  entryWasNotUpdated = 'entryWasNotUpdated',
  exceededMaxLength = 'exceededMaxLength',
  invalidSessionId = 'invalidSessionId',
  isRequired = 'isRequired',
  noIdToken = 'noIdToken',
  noSessionId = 'noSessionId',
  sessionExpired = 'sessionExpired',
  tokenWithoutInfo = 'tokenWithoutInfo',
  userNotFound = 'userNotFound',
}

export enum Field {
  target = 'target',
  comment = 'comment',
  type = 'type',
  value = 'value',
  timestamp = 'timestamp',
}
