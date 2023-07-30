import mongoose from 'mongoose';
import { env } from 'process';

export async function connect() {
  const { CONNECTION_STRING, DATABASE } = env;

  if (!CONNECTION_STRING) {
    console.error('Startup failed: CONNECTION_STRING is undefined.');
    return;
  }

  if (!DATABASE) {
    console.error('Startup failed: DATABASE is undefined.');
    return;
  }

  await mongoose.connect(CONNECTION_STRING, { dbName: DATABASE });
}
