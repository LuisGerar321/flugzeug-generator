import { before, describe, it, Test } from "mocha";
import chai from "chai";
import testDB from "@/test/util";
import chalk from "chalk";
import <%- serviceNameImport %> from "@/services/<%- serviceName %>"

describe(`${chalk.green("> <%- serviceName %>")} ${chalk.magenta("Service")} ${chalk.green("test.")}`, function() { //TODO
  before("setup test db", async function() {
    this.timeout(50000);
    await testDB.init();
    <%- serviceNameImport %>.init();
  });

  describe(chalk.yellow(`First suitCase:`), function () {
    it(`Case one`, async function() {
      chai.expect({}).not.be.equal(null);
    });
  });

  describe(chalk.yellow(`Second suitCase:`), function () {
    it(`Case one`, async function() {
      chai.expect({}).not.be.equal(null);
    });
    
    it(`Case two`, async function() {
      chai.expect({}).not.be.equal(null);
    });
  });
});
