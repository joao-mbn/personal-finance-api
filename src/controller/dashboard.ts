import { Express } from 'express';
import { DashboardWidget, Entry } from '../model';

export function loadDashboardController(app: Express) {
  const CONTROLLER = 'dashboard';

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

  app.get(`/${CONTROLLER}/getAll`, async (_, response) => {
    const entries = (await Entry.find()).map(({ _id, comments, isExpense, target, timestamp, type, value }) => ({
      id: _id,
      type,
      target,
      value: isExpense ? -Number(value) : Number(value),
      comments,
      timestamp,
    }));
    response.send(entries);
  });

  app.get(`/${CONTROLLER}/getBalances`, async (_, response) => {
    const balancePerTarget = [
      { target: 'Banco A', value: 5000 },
      { target: 'Banco B', value: 2500 },
      { target: 'Ações', value: 30000 },
      { target: 'CDB', value: 20000 },
      { target: 'Debêntures', value: 20000 },
      { target: 'Papel', value: 1000 },
    ];
    response.send({
      totalBalance: balancePerTarget.reduce((acc, curr) => acc + curr.value, 0),
      balancePerTarget,
    });
  });

  app.get(`/${CONTROLLER}/getDebts`, async (_, response) => {
    const debtsPerTarget = [
      { target: 'Banco A', value: 5000 },
      { target: 'Banco B', value: 2500 },
      { target: 'Agiota', value: 30000 },
      { target: 'Milícia', value: 20000 },
    ];
    response.send({
      totalDebts: debtsPerTarget.reduce((acc, curr) => acc + curr.value, 0),
      debtsPerTarget,
    });
  });

  app.get(`/${CONTROLLER}/dueSoonBills`, async (_, response) => {
    const bills = [
      { type: 'Conta de Luz', value: 400, dueDate: new Date(2023, 4, 1) },
      { type: 'Conta de Água', value: 100, dueDate: new Date(2023, 4, 10) },
      { type: 'Fatura do Cartão final **** 1234', value: 600, dueDate: new Date(2023, 4, 5) },
      { type: 'Condomínio', value: 600, dueDate: new Date(2023, 4, 2) },
    ];
    response.send(bills);
  });

  app.get(`/${CONTROLLER}/monthlyBalances`, async (_, response) => {
    const monthlyBalance = [
      { balance: 20000, month: new Date(2022, 1) },
      { balance: 30000, month: new Date(2022, 2) },
      { balance: 40000, month: new Date(2022, 3) },
      { balance: 50000, month: new Date(2022, 4) },
      { balance: 60000, month: new Date(2022, 5) },
      { balance: 70000, month: new Date(2022, 6) },
      { balance: 80000, month: new Date(2022, 7) },
      { balance: 90000, month: new Date(2022, 8) },
      { balance: 100000, month: new Date(2022, 9) },
      { balance: 110000, month: new Date(2022, 10) },
      { balance: 120000, month: new Date(2022, 11) },
    ];
    response.send(monthlyBalance);
  });

  app.get(`/${CONTROLLER}/monthlyDebts`, async (_, response) => {
    const monthlyDebts = [
      { debt: 10000, month: new Date(2022, 1) },
      { debt: 20000, month: new Date(2022, 2) },
      { debt: 30000, month: new Date(2022, 3) },
      { debt: 40000, month: new Date(2022, 4) },
      { debt: 50000, month: new Date(2022, 5) },
      { debt: 60000, month: new Date(2022, 6) },
      { debt: 70000, month: new Date(2022, 7) },
      { debt: 80000, month: new Date(2022, 8) },
      { debt: 90000, month: new Date(2022, 9) },
      { debt: 100000, month: new Date(2022, 10) },
      { debt: 110000, month: new Date(2022, 11) },
    ];
    response.send(monthlyDebts);
  });

  app.get(`/${CONTROLLER}/monthlyEntries`, async (_, response) => {
    const monthlyEntries = [
      { earnings: 11000, expenses: 7000, month: new Date(2022, 1) },
      { earnings: 12000, expenses: 8000, month: new Date(2022, 2) },
      { earnings: 13000, expenses: 9000, month: new Date(2022, 3) },
      { earnings: 14000, expenses: 10000, month: new Date(2022, 4) },
      { earnings: 15000, expenses: 11000, month: new Date(2022, 5) },
      { earnings: 16000, expenses: 12000, month: new Date(2022, 6) },
      { earnings: 17000, expenses: 13000, month: new Date(2022, 7) },
      { earnings: 18000, expenses: 14000, month: new Date(2022, 8) },
      { earnings: 19000, expenses: 15000, month: new Date(2022, 9) },
      { earnings: 20000, expenses: 16000, month: new Date(2022, 10) },
      { earnings: 21000, expenses: 17000, month: new Date(2022, 11) },
    ];
    response.send(monthlyEntries.map(e => ({ ...e, netEarnings: e.earnings - e.expenses })));
  });

  app.get(`/${CONTROLLER}/monthlyStocks`, async (_, response) => {
    const monthlyStocks = [
      { stocks: 70000, month: new Date(2022, 1) },
      { stocks: 80000, month: new Date(2022, 2) },
      { stocks: 90000, month: new Date(2022, 3) },
      { stocks: 100000, month: new Date(2022, 4) },
      { stocks: 110000, month: new Date(2022, 5) },
      { stocks: 120000, month: new Date(2022, 6) },
      { stocks: 130000, month: new Date(2022, 7) },
      { stocks: 140000, month: new Date(2022, 8) },
      { stocks: 150000, month: new Date(2022, 9) },
      { stocks: 160000, month: new Date(2022, 10) },
      { stocks: 170000, month: new Date(2022, 11) },
    ];
    response.send(monthlyStocks);
  });
}
