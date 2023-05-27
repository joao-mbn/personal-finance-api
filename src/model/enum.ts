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
  NoSessionId = 'NO_SESSION_ID',
  InvalidSessionId = 'INVALID_SESSION_ID',
  NoIdToken = 'NO_ID_TOKEN',
  SessionExpired = 'SESSION_EXPIRED',
  TokenWithoutInfo = 'TOKEN_WITHOUT_INFO',
}
