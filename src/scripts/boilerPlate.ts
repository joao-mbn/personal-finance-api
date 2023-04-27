import { config } from 'dotenv';
import mongoose from 'mongoose';
import { env } from 'process';

export async function boilerPlate(script: () => unknown) {
  config();

  const { CONNECTION_STRING, DATABASE } = env;

  if (!CONNECTION_STRING) {
    console.log('Startup failed: CONNECTION_STRING is undefined.');
    return;
  }
  if (!DATABASE) {
    console.log('Startup failed: DATABASE is undefined.');
    return;
  }

  await mongoose.connect(CONNECTION_STRING, { dbName: DATABASE });
  script();
}
