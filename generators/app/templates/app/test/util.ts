import { Client } from "pg";
import { config } from "@/config";
import { db, setupDBClearData } from "@/db";
import { seed } from "@/seedData";
import _ from "lodash";
import { getSequelizeTypeByDesignType } from "sequelize-typescript";
import { DataTypes, INTEGER } from "sequelize";
import randomWords from "random-words";
import { Model } from "sequelize";

/* handleTestWhatEver are functions that execute the CRUD in Tables
 *  The reason of using this functions is to take care into the code scalability
 *  In case of a modification on Sequelize CRUD methods, just modify that.
*/

/**
 * Builds a new model instance and calls save on it.
 * @param model model to call the metod
 * @param entry values
 * @returns
 */
export async function handleTestCreate(model: any, entry: Object): Promise<any> {
  try {
    const seqObj = await model.create(entry);
    return seqObj;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

/**
 * Search for a single instance.
 * @param model
 * @param id 
 */
export async function handleTestRead(model: any, id: number) {
  try {
    const seqObj = await model.findByPk(id);
    return seqObj;
  } catch (error) {
    throw error;
  }
}

/**
 * Update a model instance.
 * @param seqObjToUpdate Sequelize model to update.
 * @param entry values to update.
 */
export async function handleTestUpdate(seqObjToUpdate: any, entry: Object) {
  try {
    const seqObj = await seqObjToUpdate.update(entry);
    return seqObj;
  } catch (error) {
    throw error;
  }
}

/**
 * Delete a model instance
 * @param seqObjToDestroy Sequelize model to destroy.
 */
export function handleTestRemove(seqObjToDestroy) {
  try {
    return seqObjToDestroy.destroy();
  } catch (error) {
    throw error;
  }
}

export function wait(ms) {
  return new Promise((r, _) => setTimeout(r, ms));
}

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}

/* Provides a JS data type in base of a Sequelize.DataTypes from an Schema */
//TODO: Add more logic for BIG INT, AND LENGT FROM TYPE
export function getTypeFromSeqDataTypes(dataType: Object): String {

  const dataTypeValue = String(dataType);

  if (dataTypeValue === "" || dataTypeValue === "null") return "null";

  //Common words types into Sequalize.DataTypes
  const stringType = ["STRING", "TEXT", "CHAR", "TSVECTOR"];
  const intType = ["INT", "INTEGER"];
  const decimalType = ["REAL", "FLOAT", "DOUBLE", "DECIMAL"];
  const booleanType = ["BOOLEAN"];

  //Check if any key match into dataType string
  const isString = stringType.some(element => dataTypeValue.includes(element));
  const isInt = intType.some(element => dataTypeValue.includes(element));
  const isDecimal = decimalType.some(element => dataTypeValue.includes(element));
  const isBoolean = booleanType.some(element => dataTypeValue.includes(element));
  
  if (isString) return "string";
  
  if (isBoolean) return "boolean";

  if (isDecimal || isInt) return "number";

  return "undefined";
}
export const timeStampKeys = ["updatedAt", "createdAt"];
/**
 * Get the current schema from a Sequelize Model
 * @param Model  The Sequelize Model to read, e.g. User, Thing, etc.
 */
export function getSchema(Model: any) {
  return _.omit(Model.prototype["rawAttributes"], [...timeStampKeys, "id"]); 
}

/**Generate randon object entries from schema provided.
 It is useful when the user wants to generate a object with the attributes that are into the sequelize schema provided.
  @param seqSchema A Sequelize schama.
  @param skipAllowNull A boolean entry that determine if user wants to create attributes that allows null into the Schema provited. Otherwise, it will be ignored. So, if the flag is setted as true, It will be ignore that props and it wont be created.
*/

export function generateRndEntriesFromSchema(seqSchema: Object, skipAllowNull: Boolean = true): Object {
  const obj =  Object.keys(seqSchema).reduce((acc, key) => {
    //If schema allows null value, lets set the default value;
    if (seqSchema[key].allowNull === true && skipAllowNull === true) return acc;

    const dataType = seqSchema[key]["type"];
    
    switch ( getTypeFromSeqDataTypes(dataType) ) {
      case "number":
        acc[key] = getRndInteger(1, 100) ;
        break;
      case "string":
        acc[key] = randomWords(5)[0];
        break;
      case "boolean":
        acc[key] = !!getRndInteger(0,1);
        break;
    };

    return acc;
  }, {});
  return obj;
}

/**Generate randon object entries from schema provided.
 It is useful when the user wants to generate a object with the attributes that are into the sequelize schema provided.
  @param seqSchema A Sequelize schama.
  @param skipAllowNull A boolean entry that determine if user wants to create attributes that allows null into the Schema provited. Otherwise, it will be ignored. So, if the flag is setted as true, It will be ignore that props and it wont be created.
*/
export function generateEmptyEntriesFromSchema(seqSchema: Object, skipAllowNull: Boolean = true): Object {
  const obj =  Object.keys(seqSchema).reduce((acc, key) => {
    //If schema allows null value, lets set the default value;
    if (seqSchema[key].allowNull === true || skipAllowNull === true) return acc;

    const dataType = seqSchema[key]["type"];
    
    switch ( getTypeFromSeqDataTypes(dataType) ) {
      case "number":
        acc[key] = null;
        break;
      case "string":
        acc[key] = "";
        break;
      case "boolean":
        acc[key] = null;
        break;
    };

    return acc;
  }, {});
  return obj;
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

/*Singleton Class to set up the test database and instance it just once.
  Because the mocha tests run at multiples .test.ts files, this Singleton guarantee to run it by any mocha test that was run at first.
*/
export class TestDB {
  private static instance: TestDB;
  private isAlreadyInit: boolean = false;
  private db;

  constructor() {
    //Set attributes for future modifications here!
  }

  get getDB() {
    return this.db;
  }

  public static getInstance(): TestDB {
    if (!TestDB.instance) {
      TestDB.instance = new TestDB();
    }

    return TestDB.instance;
  }

  //Executed once when code intence it.
  async init() {
    if (!!this.isAlreadyInit) return this.db;

    await createDB();
    await addExtensions();
    this.db = await setupDBClearData();
    await seed();
    this.isAlreadyInit = true;
    return this.db;
  }
}

const testDB = TestDB.getInstance(); //Singleton creation.
export default testDB;
