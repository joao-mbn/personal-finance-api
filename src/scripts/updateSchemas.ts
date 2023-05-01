import { Debt, Entry, User } from '../model';
import { boilerPlate } from './boilerPlate';

async function refillUserWithEntries() {
  const entryIds = (await Entry.find()).map(entry => entry._id);

  await User.findByIdAndUpdate({ _id: '6449ca2830942603c86b90d2' }, { entries: entryIds }, {});
}

async function addIsPaidToDebtsAndRenameField() {
  await Debt.updateMany({}, { isPaid: false, $rename: { type: 'name' } });
}

async function changeDecimal128ToNumber() {
  await Debt.updateMany({}, { value: Math.random() * 10000 });
  await User.updateMany(
    {},
    {
      titles: [
        { name: 'PETR4', type: 'Ação', value: 2500 },
        { name: 'ITUB4', type: 'Ação', value: 3000 },
        { name: 'TAEE11', type: 'Ação', value: 6000 },
        { name: 'PCAR3', type: 'Ação', value: 4000 },
        { name: 'IPCA', type: 'Renda Fixa', value: 10000 },
        { name: 'CDB', type: 'Renda Fixa', value: 4000 },
        { name: 'LCA', type: 'Renda Fixa', value: 4500 },
      ],
    }
  );
}

async function removeIsNegativeFromAccounts() {
  await User.updateMany({}, { $unset: { 'accounts.$[].isNegative': '' } });
}

boilerPlate(refillUserWithEntries);
boilerPlate(addIsPaidToDebtsAndRenameField);
boilerPlate(changeDecimal128ToNumber);
boilerPlate(removeIsNegativeFromAccounts);
