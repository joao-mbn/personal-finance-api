import { Express, Request } from 'express';
import { ObjectId } from 'mongodb';
import { DashboardWidget, DateRangeRequest, IDebt, User } from '../model';
import { dateRangeOrDefault } from '../utils';

export function loadDashboardController(app: Express) {
  const CONTROLLER = 'dashboard';
  const USER_ID = '6449ca2830942603c86b90d2';

  app.get(`/${CONTROLLER}/getWidgets`, async (_, response) => {
    response.send([
      DashboardWidget.Balances,
      DashboardWidget.Debts,
      DashboardWidget.DueSoonBills,
      DashboardWidget.MonthlyEntries,
      DashboardWidget.MonthlyBalance,
      DashboardWidget.Assets,
      DashboardWidget.MonthlyDebts,
    ]);
  });

  app.get(`/${CONTROLLER}/getBalances`, async (_, response) => {
    const userId = USER_ID;
    const user = await User.findById(userId);

    if (!user) {
      response.status(404).send('User not found.');
      return;
    }

    const balances = user.accounts.map(({ name, value }) => ({ name, value }));
    const totalBalance = balances.reduce((total, { value }) => total + value, 0);

    response.send({ totalBalance, balances });
  });

  app.get(`/${CONTROLLER}/getDebts`, async (_, response) => {
    const userId = USER_ID;
    const user = await User.findById(userId).populate<{ debts: IDebt[] }>('debts');

    if (!user) {
      response.status(404).send('User not found.');
      return;
    }

    const debts = user?.debts.map(({ name, value }) => ({ name, value }));
    const totalDebts = debts.reduce((total, { value }) => total + value, 0);

    response.send({ totalDebts, debts });
  });

  app.get(
    `/${CONTROLLER}/getDueSoonBills`,
    async (request: Request<unknown, unknown, unknown, DateRangeRequest>, response) => {
      const { startDate, endDate } = dateRangeOrDefault(request.query);

      const userId = USER_ID;

      const debts = await User.aggregate([
        { $match: { _id: new ObjectId(userId) } },
        {
          $lookup: {
            from: 'debts',
            localField: 'debts',
            foreignField: '_id',
            as: 'debts',
          },
        },
        { $unwind: '$debts' },
        {
          $project: { name: '$debts.name', value: '$debts.value', dueDate: '$debts.dueDate', isPaid: '$debts.isPaid' },
        },
        {
          $match: {
            $or: [{ dueDate: { $gte: startDate, $lt: endDate } }, { dueDate: { $lt: startDate }, isPaid: false }],
          },
        },
        { $sort: { dueDate: 1 } },
        { $project: { _id: 0 } },
      ]);

      response.send(debts);
    }
  );

  app.get(
    `/${CONTROLLER}/getMonthlyBalances`,
    async (request: Request<unknown, unknown, unknown, DateRangeRequest>, response) => {
      const { startDate, endDate } = dateRangeOrDefault(request.query);

      const userId = USER_ID;

      const balancesByMonth = (
        await User.aggregate<{ _id: string; earnings: number; expenses: number; balance: number }>([
          { $match: { _id: new ObjectId(userId) } },
          { $addFields: { balance: { $sum: '$accounts.value' } } },
          {
            $lookup: {
              from: 'entries',
              localField: 'entries',
              foreignField: '_id',
              as: 'entries',
            },
          },
          { $unwind: '$entries' },
          { $match: { 'entries.timestamp': { $gte: startDate, $lte: endDate } } },
          {
            $project: {
              _id: 0,
              balance: 1,
              timestamp: '$entries.timestamp',
              value: '$entries.value',
            },
          },
          {
            $group: {
              _id: { $dateToString: { format: '%m/%Y', date: '$timestamp' } },
              earnings: { $sum: { $cond: [{ $gte: ['$value', 0] }, '$value', 0] } },
              expenses: { $sum: { $cond: [{ $lt: ['$value', 0] }, '$value', 0] } },
              balance: { $first: '$balance' },
              timestamp: { $first: '$timestamp' },
            },
          },
          { $sort: { timestamp: 1 } },
        ])
      ).reduce((acc: { month: string; balance: number }[], { _id: month, earnings, expenses, balance }, index) => {
        const refBalance = index === 0 ? balance : acc[index - 1].balance;
        return [...acc, { month, balance: refBalance - (earnings + expenses), expenses, earnings }];
      }, []);

      response.send(balancesByMonth);
    }
  );

  app.get(
    `/${CONTROLLER}/getMonthlyDebts`,
    async (request: Request<unknown, unknown, unknown, DateRangeRequest>, response) => {
      const { startDate, endDate } = dateRangeOrDefault(request.query);

      const userId = USER_ID;

      const debts = await User.aggregate([
        { $match: { _id: new ObjectId(userId) } },
        {
          $lookup: {
            from: 'debts',
            localField: 'debts',
            foreignField: '_id',
            as: 'debts',
          },
        },
        { $unwind: '$debts' },
        {
          $project: { name: '$debts.name', value: '$debts.value', dueDate: '$debts.dueDate', isPaid: '$debts.isPaid' },
        },
        {
          $match: {
            $or: [{ dueDate: { $gte: startDate, $lt: endDate } }, { dueDate: { $lt: startDate }, isPaid: false }],
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%m/%Y', date: '$dueDate' } },
            debt: { $sum: '$value' },
            dueDate: { $first: '$dueDate' },
          },
        },
        { $sort: { dueDate: 1 } },
        { $project: { _id: 0, month: '$_id', debt: 1 } },
      ]);

      response.send(debts);
    }
  );

  app.get(
    `/${CONTROLLER}/getMonthlyEntries`,
    async (request: Request<unknown, unknown, unknown, DateRangeRequest>, response) => {
      const { startDate, endDate } = dateRangeOrDefault(request.query);

      const userId = USER_ID;

      const entriesByMonth = await User.aggregate([
        { $match: { _id: new ObjectId(userId) } },
        {
          $lookup: {
            from: 'entries',
            localField: 'entries',
            foreignField: '_id',
            as: 'entries',
          },
        },
        { $unwind: '$entries' },
        { $match: { 'entries.timestamp': { $gte: startDate, $lte: endDate } } },
        { $project: { _id: 0, timestamp: '$entries.timestamp', value: '$entries.value' } },
        {
          $group: {
            _id: { $dateToString: { format: '%m/%Y', date: '$timestamp' } },
            earnings: { $sum: { $cond: [{ $gte: ['$value', 0] }, '$value', 0] } },
            expenses: { $sum: { $cond: [{ $lt: ['$value', 0] }, '$value', 0] } },
            timestamp: { $first: '$timestamp' },
          },
        },
        { $sort: { timestamp: 1 } },
        {
          $project: {
            _id: 0,
            month: '$_id',
            earnings: 1,
            expenses: 1,
            netEarnings: { $add: ['$earnings', '$expenses'] },
          },
        },
      ]);

      response.send(entriesByMonth);
    }
  );

  app.get(`/${CONTROLLER}/getAssets`, async (_, response) => {
    const userId = USER_ID;

    const assets = await User.aggregate([
      { $match: { _id: new ObjectId(userId) } },
      { $unwind: '$titles' },
      { $project: { _id: 0, name: '$titles.name', value: '$titles.value', type: '$titles.type' } },
      { $group: { _id: '$type', value: { $sum: '$value' } } },
      { $project: { _id: 0, type: '$_id', value: 1 } },
    ]);

    response.send(assets);
  });
}
