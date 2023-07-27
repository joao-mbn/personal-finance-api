import { Request, Router } from 'express';
import { DateRangeRequest } from '../model';
import {
  getAssets,
  getBalances,
  getDebts,
  getDueSoonBills,
  getMonthlyBalances,
  getMonthlyDebts,
  getMonthlyEntries,
  getWidgets,
} from '../service/dashboard.service';

const USER_ID = '6449ca2830942603c86b90d2';
export const router = Router();

router.get('/getWidgets', async (_, response) => {
  const widgets = getWidgets();
  response.send(widgets);
});

router.get('/getBalances', async (_, response) => {
  const userId = USER_ID;
  const balances = await getBalances(userId);
  response.send(balances);
});

router.get('/getDebts', async (_, response) => {
  const userId = USER_ID;
  const debts = await getDebts(userId);
  response.send(debts);
});

router.get('/getDueSoonBills', async (request: Request<unknown, unknown, unknown, DateRangeRequest>, response) => {
  const userId = USER_ID;
  const debts = await getDueSoonBills(request.query, userId);
  response.send(debts);
});

router.get('/getMonthlyBalances', async (request: Request<unknown, unknown, unknown, DateRangeRequest>, response) => {
  const userId = USER_ID;
  const balancesByMonth = await getMonthlyBalances(request.query, userId);
  response.send(balancesByMonth);
});

router.get('/getMonthlyDebts', async (request: Request<unknown, unknown, unknown, DateRangeRequest>, response) => {
  const userId = USER_ID;
  const debtsByMonth = await getMonthlyDebts(request.query, userId);
  response.send(debtsByMonth);
});

router.get('/getMonthlyEntries', async (request: Request<unknown, unknown, unknown, DateRangeRequest>, response) => {
  const userId = USER_ID;
  const entriesByMonth = await getMonthlyEntries(request.query, userId);
  response.send(entriesByMonth);
});

router.get('/getAssets', async (_, response) => {
  const userId = USER_ID;
  const assets = await getAssets(userId);
  response.send(assets);
});
