import { Express } from 'express';
import { ObjectId } from 'mongodb';
import { DashboardWidget, IDebt, User } from '../model';

export function loadDashboardController(app: Express) {
  const CONTROLLER = 'dashboard';
  const USER_ID = '6449ca2830942603c86b90d2';

  app.get(`/${CONTROLLER}/getWidgets`, async (_, response) => {
    response.send([
      DashboardWidget.Balance,
      DashboardWidget.Debts,
      DashboardWidget.DueSoonBills,
      DashboardWidget.MonthlyEntries,
      DashboardWidget.MonthlyBalance,
      DashboardWidget.MonthlyStocks,
      DashboardWidget.MonthlyDebts,
    ]);
  });

  app.get(`/${CONTROLLER}/getBalances`, async (request, response) => {
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

  app.get(`/${CONTROLLER}/getDebts`, async (request, response) => {
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

  app.get(`/${CONTROLLER}/getDueSoonBills`, async (request, response) => {
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + 3);

    const userId = USER_ID;

    const debts = await User.aggregate<IDebt>([
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
      { $project: { name: '$debts.name', value: '$debts.value', dueDate: '$debts.dueDate', isPaid: '$debts.isPaid' } },
      {
        $match: {
          $or: [{ dueDate: { $gte: startDate, $lt: endDate } }, { dueDate: { $lt: startDate }, isPaid: false }],
        },
      },
      { $sort: { dueDate: -1 } },
      { $set: { dueDate: { $dateToString: { format: '%d/%m/%Y', date: '$dueDate' } } } },
    ]);

    response.send(debts);
  });

  app.get(`/${CONTROLLER}/getMonthlyBalances`, async (_, response) => {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setMonth(endDate.getMonth() - 8);

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
            isExpense: '$entries.isExpense',
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
        { $sort: { timestamp: -1 } },
      ])
    ).reduce((acc: { month: string; balance: number }[], { _id: month, earnings, expenses, balance }, index) => {
      const refBalance = index === 0 ? balance : acc[index - 1].balance;
      return [...acc, { month, balance: refBalance - (earnings + expenses), expenses, earnings }];
    }, []);

    response.send(balancesByMonth);
  });

  app.get(`/${CONTROLLER}/getMonthlyDebts`, async (_, response) => {
    const endDate = new Date(2023, 6, 1);
    const startDate = new Date(endDate);
    startDate.setMonth(endDate.getMonth() - 8);

    const userId = USER_ID;

    const debts = await User.aggregate<{ debt: number; month: string }>([
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
      { $project: { name: '$debts.name', value: '$debts.value', dueDate: '$debts.dueDate', isPaid: '$debts.isPaid' } },
      {
        $match: {
          $or: [{ dueDate: { $gte: startDate, $lt: endDate } }, { dueDate: { $lt: startDate }, isPaid: false }],
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%m/%Y', date: '$dueDate' } },
          debt: { $sum: '$value' },
        },
      },
      { $sort: { id: 1 } },
      { $addFields: { month: '$_id' } },
    ]);

    response.send(debts);
  });

  app.get(`/${CONTROLLER}/getMonthlyEntries`, async (request, response) => {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setMonth(endDate.getMonth() - 8);

    const userId = USER_ID;

    const entriesByMonth = await User.aggregate<{
      month: string;
      earnings: number;
      expenses: number;
      netEarnings: number;
    }>([
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
      {
        $project: { _id: 0, timestamp: '$entries.timestamp', value: '$entries.value', isExpense: '$entries.isExpense' },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%m/%Y', date: '$timestamp' } },
          earnings: { $sum: { $cond: [{ $gte: ['$value', 0] }, '$value', 0] } },
          expenses: { $sum: { $cond: [{ $lt: ['$value', 0] }, '$value', 0] } },
        },
      },
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
  });

  app.get(`/${CONTROLLER}/getAssets`, async (_, response) => {
    const userId = USER_ID;

    const assets = await User.aggregate<{ type: string; value: number }>([
      { $match: { _id: new ObjectId(userId) } },
      { $unwind: '$titles' },
      { $project: { _id: 0, name: '$titles.name', value: '$titles.value', type: '$titles.type' } },
      { $group: { _id: '$type', value: { $sum: '$value' } } },
    ]);

    response.send(assets);
  });
}
