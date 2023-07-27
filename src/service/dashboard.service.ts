import { ObjectId } from 'mongodb';
import { DashboardWidget, DateRangeRequest, IDebt, User } from '../model';
import { dateRangeOrDefault } from '../utils';
import { getUserById } from './user.service';

export function getWidgets() {
  return [
    DashboardWidget.Balances,
    DashboardWidget.Debts,
    DashboardWidget.DueSoonBills,
    DashboardWidget.MonthlyEntries,
    DashboardWidget.MonthlyBalance,
    DashboardWidget.Assets,
    DashboardWidget.MonthlyDebts,
  ];
}

export async function getBalances(userId: string) {
  const user = await getUserById(userId, true);
  const balances = user?.accounts.map(({ name, value }) => ({ name, value }));
  const totalBalance = balances?.reduce((total, { value }) => total + value, 0);

  return { balances, totalBalance };
}

export async function getDebts(userId: string) {
  const user = await (await getUserById(userId, true))?.populate<{ debts: IDebt[] }>('debts');

  const debts = user?.debts.map(({ name, value }) => ({ name, value }));
  const totalDebts = debts?.reduce((total, { value }) => total + value, 0);

  return { totalDebts, debts };
}

export async function getDueSoonBills(dateRange: DateRangeRequest, userId: string) {
  const { startDate, endDate } = dateRangeOrDefault(dateRange);

  const debts = await User.aggregate([
    { $match: { _id: new ObjectId(userId) } },
    { $lookup: { from: 'debts', localField: 'debts', foreignField: '_id', as: 'debts' } },
    { $unwind: '$debts' },
    { $project: { name: '$debts.name', value: '$debts.value', dueDate: '$debts.dueDate', isPaid: '$debts.isPaid' } },
    {
      $match: { $or: [{ dueDate: { $gte: startDate, $lt: endDate } }, { dueDate: { $lt: startDate }, isPaid: false }] },
    },
    { $sort: { dueDate: 1 } },
    { $project: { _id: 0 } },
  ]);

  return debts;
}

export async function getMonthlyBalances(dateRange: DateRangeRequest, userId: string) {
  const { startDate, endDate } = dateRangeOrDefault(dateRange);

  const balancesByMonth = (
    await User.aggregate<{ _id: string; earnings: number; expenses: number; balance: number }>([
      { $match: { _id: new ObjectId(userId) } },
      { $addFields: { balance: { $sum: '$accounts.value' } } },
      { $lookup: { from: 'entries', localField: 'entries', foreignField: '_id', as: 'entries' } },
      { $unwind: '$entries' },
      { $match: { 'entries.timestamp': { $gte: startDate, $lte: endDate } } },
      { $project: { _id: 0, balance: 1, timestamp: '$entries.timestamp', value: '$entries.value' } },
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

  return balancesByMonth;
}

export async function getMonthlyDebts(dateRange: DateRangeRequest, userId: string) {
  const { startDate, endDate } = dateRangeOrDefault(dateRange);

  const debtsByMonth = await User.aggregate([
    { $match: { _id: new ObjectId(userId) } },
    { $lookup: { from: 'debts', localField: 'debts', foreignField: '_id', as: 'debts' } },
    { $unwind: '$debts' },
    { $project: { name: '$debts.name', value: '$debts.value', dueDate: '$debts.dueDate', isPaid: '$debts.isPaid' } },
    {
      $match: { $or: [{ dueDate: { $gte: startDate, $lt: endDate } }, { dueDate: { $lt: startDate }, isPaid: false }] },
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

  return debtsByMonth;
}

export async function getMonthlyEntries(dateRange: DateRangeRequest, userId: string) {
  const { startDate, endDate } = dateRangeOrDefault(dateRange);

  const entriesByMonth = await User.aggregate([
    { $match: { _id: new ObjectId(userId) } },
    { $lookup: { from: 'entries', localField: 'entries', foreignField: '_id', as: 'entries' } },
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
      $project: { _id: 0, month: '$_id', earnings: 1, expenses: 1, netEarnings: { $add: ['$earnings', '$expenses'] } },
    },
  ]);

  return entriesByMonth;
}

export async function getAssets(userId: string) {
  const assets = await User.aggregate([
    { $match: { _id: new ObjectId(userId) } },
    { $unwind: '$titles' },
    { $project: { _id: 0, name: '$titles.name', value: '$titles.value', type: '$titles.type' } },
    { $group: { _id: '$type', value: { $sum: '$value' } } },
    { $project: { _id: 0, type: '$_id', value: 1 } },
  ]);

  return assets;
}
