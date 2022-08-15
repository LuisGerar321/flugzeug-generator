import { before, describe, it } from "mocha";
import chai from "chai";
import chaiHttp from "chai-http";
import testDB from "@/test/util";
import { config } from "@/config";
import { app } from "@/server";
import _ from "lodash";
import chalk from "chalk";

describe(chalk.magenta("Test <%- controllerName %> Endpoints"), function() {
  let token = "";

  before("Setup DB and get token", async function() {
    this.timeout(50000);
  });

  describe(chalk.yellow(`message`), function () {
    it(`should create an cute message`, async function() {
      chai.expect({}).to.be.equal();
      console.log("Hii bru <3")
    });
  })
});