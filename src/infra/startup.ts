import { config } from 'dotenv';
import { initApp } from './app';
import { connect } from './database';

async function startup() {
  try {
    // add variables from .env to ENV.
    config();

    // starts the API.
    initApp();

    // connect to database.
    await connect();
  } catch (error) {
    console.log(error);
  }
}

startup();
