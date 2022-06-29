require("dotenv").config();
process.env.DB_NAME = "app-backend-test";

import { before, describe, it } from "mocha";
import chai from "chai";
import chaiHttp from "chai-http";
import { setUpTestDB } from "@/test/util";
import { config } from "@/config";
import { <%- controllerName %> } from "@/models/<%- controllerName %>";
import { app } from "@/server";
import _ from "lodash";
import chalk from "chalk";


chai.use(chaiHttp);


describe(chalk.magenta("Test <%- controllerName %> Endpoints"), function() {
  let token = "";

  before("Setup DB and get token", async function() {
    this.timeout(50000);
    await setUpTestDB();
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
    }
  });

  describe(chalk.yellow(`<%- controllerName %>  POST Method`), function () {
    //Customize it to fit your needs!
    const <%- modelName %>Body = {
      name: `<%- controllerName %>Name`,
    }

    it(`should create an <%- modelName %>`, async function() {


      const res = await chai.request(app)
        .post(`/api/v1/<%- controllerName %>`)
        .set("Authorization", `Bearer ${token}`)
        .send(<%- modelName %>Body);

      chai.expect(res).to.have.status(201);
      chai.expect(res.body.data).to.include(_.pick(res.body.data, ["id", "name"]));
    });

    it(`should failed <%- modelName %> creation, ${Object.keys(<%- modelName %>Body)[0]} is required`, async function() {

      const <%- modelName %>BodyNameNull =  _.clone(<%- modelName %>Body);
      <%- modelName %>BodyNameNull.name = null;

      const res = await chai.request(app)
        .post(`/api/v1/<%- controllerName %>Body`)
        .set("Authorization", `Bearer ${token}`)
        .send(<%- modelName %>BodyNameNull.name);

      chai.expect(res).to.have.status(500);
    });
  })


  describe(chalk.yellow(`${props.controllerName}  GET Method`), function () {
    let id = null;
    it(`should GET all <%- modelName %>`, async function() {
      const res = await chai.request(app)
        .get(`/api/v1/<%- controllerName %>`)
        .set("Authorization", `Bearer ${token}`);
      
      chai.expect(res).to.have.status(200);
      chai.expect(res.body.data).to.be.an("array");
    });

    it(`should GET <%- modelName %>`, async function() {
      const res = await chai.request(app)
        .get(`/api/v1/<%- controllerName %>`)
        .set("Authorization", `Bearer ${token}`);

      chai.expect(res).to.have.status(200);
      chai.expect(res.body.data).to.be.an("array");
    });
  })

});