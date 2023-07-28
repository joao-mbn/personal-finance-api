import { Request, Router } from 'express';
import { asyncHandler } from '../core/asyncHandler';
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
import { getUserFromRequest } from '../service/user.service';

export const router = Router();

router.get('/getWidgets', async (_, response) => {
  const widgets = getWidgets();
  response.send(widgets);
});

router.get(
  '/getBalances',
  asyncHandler(async (request, response) => {
    const { id: userId } = getUserFromRequest(request);

    const balances = await getBalances(userId);
    response.send(balances);
  })
);

router.get(
  '/getDebts',
  asyncHandler(async (request, response) => {
    const { id: userId } = getUserFromRequest(request);

    const debts = await getDebts(userId);
    response.send(debts);
  })
);

router.get(
  '/getDueSoonBills',
  asyncHandler(async (request: Request<unknown, unknown, unknown, DateRangeRequest>, response) => {
    const { id: userId } = getUserFromRequest(request);

    const debts = await getDueSoonBills(request.query, userId);
    response.send(debts);
  })
);

router.get(
  '/getMonthlyBalances',
  asyncHandler(async (request: Request<unknown, unknown, unknown, DateRangeRequest>, response) => {
    const { id: userId } = getUserFromRequest(request);

    const balancesByMonth = await getMonthlyBalances(request.query, userId);
    response.send(balancesByMonth);
  })
);

router.get(
  '/getMonthlyDebts',
  asyncHandler(async (request: Request<unknown, unknown, unknown, DateRangeRequest>, response) => {
    const { id: userId } = getUserFromRequest(request);

    const debtsByMonth = await getMonthlyDebts(request.query, userId);
    response.send(debtsByMonth);
  })
);

router.get(
  '/getMonthlyEntries',
  asyncHandler(async (request: Request<unknown, unknown, unknown, DateRangeRequest>, response) => {
    const { id: userId } = getUserFromRequest(request);

    const entriesByMonth = await getMonthlyEntries(request.query, userId);
    response.send(entriesByMonth);
  })
);

router.get(
  '/getAssets',
  asyncHandler(async (request, response) => {
    const { id: userId } = getUserFromRequest(request);

    const assets = await getAssets(userId);
    response.send(assets);
  })
);
