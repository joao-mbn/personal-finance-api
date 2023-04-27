import { User } from '../model';
import { boilerPlate } from './boilerPlate';

async function createUserCollection() {
  User.createCollection().then(() => {
    console.log('User collection created');
  });
}

boilerPlate(createUserCollection);
