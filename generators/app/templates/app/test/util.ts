import { Client } from "pg";
import { config } from "@/config";
import { db, setupDBClearData } from "@/db";
import { seed } from "@/seedData";
export function wait(ms) {
  return new Promise((r, _) => setTimeout(r, ms));
}
export async function createDB() {
  const connection = new Client({
    host: config.db.host,
    user: config.db.username,
    password: config.db.password,
  });

  await connection.connect();

  try {
    await connection.query(`DROP DATABASE IF EXISTS "${config.db.database}"`);
    await connection.query(`CREATE DATABASE "${config.db.database}"`);
  } catch (err) {
    if (err) throw err;
  }

  await connection.end();
}
export async function addExtensions() {
  const connection = new Client({
    host: config.db.host,
    user: config.db.username,
    password: config.db.password,
    database: config.db.database,
  });
  await connection.connect();
  try {
    await connection.query(`DROP EXTENSION IF EXISTS pgcrypto`);
    await connection.query(`CREATE EXTENSION pgcrypto`);
  } catch (err) {
    if (err) throw err;
  }
  await connection.end();
}
export const setUpTestDB = async () => {
  await createDB();
  await addExtensions();
  await setupDBClearData();
  await seed();
};
export class TestDb {
  static db;
  on: boolean;
  constructor() {
    if (!!TestDb.db) return TestDb.db;
    TestDb.db = this;
    this.on = true;
    return this;
  }
  async init(){
    (async () => {
      console.log("Executed!");
      await setUpTestDB();
      console.log("Finish Executed!")
    })();
  }
}
export const closeSetDB = async () => {
  await db.close();
};
