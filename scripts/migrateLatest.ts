import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { glob } from 'glob';
import path from 'path';

const DB_MIGRATIONS_GLOB_PATTERN = 'db_migrations/*.ts';

(async () => {
  await migrateLatest();
  process.exit(0);
})();

async function migrateLatest() {
  try {
    console.log('Searching for latest migration...');

    const migrations = await glob(DB_MIGRATIONS_GLOB_PATTERN);
    const latestMigration = migrations.sort().pop();
    if (!latestMigration) {
      console.log('No migrations found!');
      return;
    }
    console.log(`Migration: ${latestMigration} - In Progress ⏳`);
    const migrationModule = await require(path.resolve(latestMigration));

    const db = getDb();
    await migrationModule.up({ db });
    console.log(`Migration: ${latestMigration} - Completed ✅`);
  } catch (error) {
    console.error(`Error executing migration`, error);
  }
}

function getDb() {
  const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
  };
  const app = initializeApp(firebaseConfig);
  return initializeFirestore(app, {});
}
