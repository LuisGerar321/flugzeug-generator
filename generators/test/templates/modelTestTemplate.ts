import { before, describe, it, Test } from "mocha";
import chai from "chai";
import testDB, { generateRndEntriesFromSchema, getSchema, handleTestCreate, handleTestRead, handleTestRemove, handleTestUpdate, timeStampKeys } from "@/test/util";
import _ from "lodash";
import chalk from "chalk";
import { <%- modelName %> } from "@/models/<%- modelName %>"

let a<%- modelName %>Table: <%- modelName %>;
const <%- modelName %>Schema: Partial<<%- modelName %>> = getSchema(<%- modelName %>);
const <%- modelName %>Entries: Partial<<%- modelName %>> = generateRndEntriesFromSchema(<%- modelName %>Schema);
// const <%- modelName %>Entries: Partial<<%- modelName %>> = generateEmptyEntriesFromSchema(<%- modelName %>Schema); //Use in case that you just want an empty object to fill later

describe(`${chalk.green("> <%- modelName %>")} ${chalk.magenta("Model")} ${chalk.green("test.")}`, function() {
  before("setup test db", async function() {
    this.timeout(50000);
    await testDB.init();
  });

  describe(chalk.yellow(`CRUD Operations:`), function () {
    it(`Create`, async function() {
      a<%- modelName %>Table = await handleTestCreate(<%- modelName %>,<%- modelName %>Entries);
      chai.expect(<%- modelName %>Entries).to.be.deep.equal(_.pick(a<%- modelName %>Table, Object.keys(<%- modelName %>Entries)));
    });

    it(`Read`, async function() {
      const <%- modelName %> = await handleTestRead(<%- modelName %>, a<%- modelName %>Table.id);
      chai.expect(<%- modelName %>).to.not.equal(null);
    });

    it(`Update`, async function() {
      const <%- modelName %> = await handleTestRead(<%- modelName %>, a<%- modelName %>Table.id);
      const <%- modelName %>Schema = getSchema(<%- modelName %>);
      const newAttributes = generateRndEntriesFromSchema(<%- modelName %>Schema);
      const updated<%- modelName %> = await handleTestUpdate(<%- modelName %>, newAttributes);
      const <%- modelName %>Modified = await handleTestRead(<%- modelName %>, a<%- modelName %>Table.id);
      chai.expect(_.omit(<%- modelName %>Modified["dataValues"] ,  [...timeStampKeys, "id"])).to.be.deep.equal( _.omit(updated<%- modelName %>["dataValues"] ,  [...timeStampKeys, "id"]));
    });

    it(`Delete`, async function() {
      const <%- modelName %> = await handleTestRead(<%- modelName %>, a<%- modelName %>Table.id);
      const deleted = await handleTestRemove(<%- modelName %>);
      const <%- modelName %>Deleted = await handleTestRead(<%- modelName %>, a<%- modelName %>Table.id);
      chai.expect(<%- modelName %>Deleted).to.be.equal(null);
    });
  })
});
