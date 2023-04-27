import { Debt, Entry, User } from '../model';
import { boilerPlate } from './boilerPlate';

async function mockData() {
  const entries = await Entry.find();
  console.log('Fetched Entries.');

  const debts = await Debt.insertMany([
    {
      type: '1ª parcela do Notebook',
      value: 2000,
      dueDate: new Date('2023-05-30'),
    },
    {
      type: '2ª parcela do Notebook',
      value: 2000,
      dueDate: new Date('2023-06-30'),
    },
    {
      type: 'Cartão de Crédito',
      value: 1000,
      dueDate: new Date('2023-05-15'),
    },
  ]);
  console.log('Inserted debts.');

  await User.findByIdAndUpdate('6449ca2830942603c86b90d2', {
    $push: {
      accounts: {
        $each: [
          { name: 'Inter', value: 5000, isNegative: false },
          { name: 'Itaú', value: 200, isNegative: false },
          { name: 'Papel', value: 500, isNegative: false },
          { name: 'Nubank', value: 800, isNegative: true },
        ],
      },
      debts: { $each: debts.map(debt => debt._id) },
      entries: { $each: entries.map(debt => debt._id) },
      titles: {
        $each: [
          { name: 'PETR4', type: 'Ação', value: 2500 },
          { name: 'ITUB4', type: 'Ação', value: 3000 },
          { name: 'TAEE11', type: 'Ação', value: 6000 },
          { name: 'PCAR3', type: 'Ação', value: 4000 },
          { name: 'IPCA', type: 'Renda Fixa', value: 10000 },
          { name: 'CDB', type: 'Renda Fixa', value: 4000 },
          { name: 'LCA', type: 'Renda Fixa', value: 4500 },
        ],
      },
    },
  });
  console.log('Updated User.');
}

boilerPlate(mockData);
