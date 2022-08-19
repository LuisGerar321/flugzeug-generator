require("dotenv").config();
process.env.DB_NAME = "app-backend-test";

import { before, describe, it } from "mocha";
import chai from "chai";
import chaiHttp from "chai-http";
import { config } from "@/config";
import { <%- modelName %> } from "@/models/<%- modelName %>";
import testDB, { generateRndEntriesFromSchema, generateEmptyEntriesFromSchema, getSchema, timeStampKeys } from "@/test/util";
import { app } from "@/server";
import _ from "lodash";
import chalk from "chalk";

chai.use(chaiHttp);

describe(`${chalk.green("> <%- controllerName %>")} ${chalk.magenta("Controller")} ${chalk.green("test.")}`, function() {
  let token = "";
  before("Setup DB and get token", async function() {
    this.timeout(50000);
    await testDB.init();
    const user = {
      email: "admin@example.com",
      password: "adminadmin",
    };

    try { 
      const res = await chai.request(app)
        .post("/api/v1/auth/login")
        .send(user)
      token = res.body.data?.token ?? "";
    } catch (e) {
      console.log("Error: ", e);
    };
  });

  describe(chalk.yellow(`<%- controllerName %> POST Method:`), function () {
    const <%- modelName %>Schema = getSchema(<%- modelName %>);
    const <%- modelName %>Body = generateRndEntriesFromSchema(<%- modelName %>Schema);

    it(`should create an <%- modelName %>`, async function() {
      const res = await chai.request(app)
        .post(`/api/v1/<%- endPoint %>`)
        .set("Authorization", `Bearer ${token}`)
        .send(<%- modelName %>Body);
      chai.expect(res).to.have.status(201);
      chai.expect(res.body.data).to.include(_.pick(res.body.data, ["id", "name"]));
    });

    it(`should failed <%- modelName %> creation, ${Object.keys(<%- modelName %>Body)[0]} can not be null`, async function() {
      const <%- modelName %>Schema = getSchema(<%- modelName %>);
      const <%- modelName %>BodyNameNull = generateEmptyEntriesFromSchema(<%- modelName %>Schema);
      const res = await chai.request(app)
        .post(`/api/v1/<%- endPoint %>`)
        .set("Authorization", `Bearer ${token}`)
        .send(<%- modelName %>BodyNameNull);
      chai.expect(res).to.have.status(500);
    });
  });

  describe(chalk.yellow(`<%- controllerName %> GET Method:`), function () {
    it(`should GET all <%- modelName %>`, async function() {
      const res = await chai.request(app)
        .get(`/api/v1/<%- endPoint %>`)
        .set("Authorization", `Bearer ${token}`);
      chai.expect(res).to.have.status(200);
      chai.expect(res.body.data).to.be.an("array");
    });

    it(`should GET <%- modelName %>`, async function() {
      const res = await chai.request(app)
        .get(`/api/v1/<%- endPoint %>`)
        .set("Authorization", `Bearer ${token}`);
      chai.expect(res).to.have.status(200);
      chai.expect(res.body.data).to.be.an("array");
    });
  });

  describe(chalk.yellow(`<%- controllerName %> PUT Method:`), function () {
    it(`should update a <%- modelName %>`, async function() {
      const <%- modelName %>Schema = getSchema(<%- modelName %>);
      const <%- modelName %>Body = generateRndEntriesFromSchema(<%- modelName %>Schema);
      const res = await chai.request(app)
        .put(`/api/v1/<%- endPoint %>/1`)
        .set("Authorization", `Bearer ${token}`)
        .send(<%- modelName %>Body);
      chai.expect(res).to.have.status(200);
      chai.expect(_.omit(res.body.data, [...timeStampKeys, "id"])).to.include(<%- modelName %>Body);
    });

    it(`should retrives a 404 status code because Thing ID to be updated was not found.`, async function() {
      const <%- modelName %>Schema = getSchema(<%- modelName %>);
      const <%- modelName %>Body = generateRndEntriesFromSchema(<%- modelName %>Schema);
      const res = await chai.request(app)
        .put(`/api/v1/<%- endPoint %>/1000`)
        .set("Authorization", `Bearer ${token}`)
        .send(<%- modelName %>Body);
      chai.expect(res).to.have.status(404);
    });
  });

  describe(chalk.yellow(`<%- controllerName %> DELETE Method:`), function () {
    it(`should update a <%- modelName %>`, async function() {
      const res = await chai.request(app)
        .delete(`/api/v1/<%- endPoint %>/1`)
        .set("Authorization", `Bearer ${token}`);
      chai.expect(res).to.have.status(204);
    });

    it(`should retrieves a 404 status code because <%- modelName %> ID  was not found.`, async function() {
      const res = await chai.request(app)
        .put(`/api/v1/<%- endPoint %>/1000`)
        .set("Authorization", `Bearer ${token}`);
      chai.expect(res).to.have.status(404);
    });
  });
});
