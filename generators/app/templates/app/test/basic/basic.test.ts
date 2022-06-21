require("dotenv").config();
process.env.DB_NAME = "app-backend-test";

import chai from "chai";
import authService, { AuthCredentials, JWTPayload, Token } from "@/services/AuthService";
import { setUpTestDB } from "@/test/util";
import { log } from "@/libraries/Log";
import { TokenExpiredError } from "jsonwebtoken";
import { AuthType, User } from "@/models/User";
import { Role } from "@/models/Role";
import onboardingService from "@/services/OnboardingService"
import { UniqueConstraintError } from "sequelize/types";
import _ from "lodash";

describe("Test basic app unit test", () => {
  before(async function() {
    this.timeout(50000);
    await setUpTestDB();
    log.info("app-backend-test database is ready!");
  });

  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1wbG95ZWVJZCI6OSwic3ViIjoiYWNjZXNzIiwiYXVkIjoidXNlciIsImV4cCI6MTY1NzIxMjA3NS4zMTYsImlhdCI6MTY1NDYyMDA3NS4zMTYsImp0aSI6IjNiYjg3NGNkLTc4NjQtNDYwNy05YWY1LTcyY2VkZTY0NTU1ZCIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlcyI6WzVdfQ.vazduQLO0O2pwVrcj2cN1YYbNocaFCtzmyKfcr8XhBQ";
  const jwtBody = {
    id: 1,
    employeeId: 9,
    sub: "access",
    aud: "user",
    exp: 1657212075.316,
    iat: 1654620075.316,
    jti: "3bb874cd-7864-4607-9af5-72cede64555d",
    email: "admin@example.com",
    roles: [5],
  };
  const tokenExpired =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1wbG95ZWVJZCI6OSwic3ViIjoiYWNjZXNzIiwiYXVkIjoidXNlciIsImV4cCI6MC4zMTYsImlhdCI6MTY1NDYyMDA3NS4zMTYsImp0aSI6IjNiYjg3NGNkLTc4NjQtNDYwNy05YWY1LTcyY2VkZTY0NTU1ZCIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlcyI6WzVdfQ.Zbt50VpQ7UIC1_3oC9uBVq3aDax227sDlOgtLEFflLc";

  describe("#validateJWT()", () => {

    it("should be destructure jwt property a get token info", async () => {
      let jwt;
      try {
        jwt = await authService.validateJWT(token, "access");
      } catch (e) {
        jwt = null;
      }
      chai.expect(jwt).to.be.deep.equal(jwtBody);
    });

    it("should be object type", async () => {
      let jwt;
      try {
        jwt = await authService.validateJWT(token, "access");
      } catch (e) {
        jwt = null;
      }
      chai.expect(jwt).to.be.an("object");
    });

    it("should throw an error 'TokenExpiredError' because it expired", async () => {
      try {
        await authService.validateJWT(tokenExpired, "access");
      } catch (e) {
        chai.expect(e).to.be.instanceOf(TokenExpiredError);
        chai.expect(e.message).to.eql("jwt expired");
      }
    });
  });

  describe("#createToken()", () => {

    it("should create an access token in base of a user", async () => {
      const user = await User.findOne({
        include: [{ model: Role, as: "roles" }],
      });

      let tokenCreation;
      try {
        tokenCreation = await authService.createToken(user, "access");
      } catch (e) {
        tokenCreation = null;
      }
      chai.assert.isNotNull(tokenCreation);
    });

    it("should create an reset token in base of any user", async () => {
      const user = await User.findOne({
        include: [{ model: Role, as: "roles" }],
      });

      let tokenCreation;
      try {
        tokenCreation = await authService.createToken(user, "reset");
      } catch (e) {
        tokenCreation = null;
      }
      chai.assert.isNotNull(tokenCreation);
    });

    it("token should be an object token type", async () => {
      const user = await User.findOne({
        include: [{ model: Role, as: "roles" }],
      });
      
      
      let tokenCreation;
      const expectedToken: Token = {
        token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic3ViIjoiYWNjZXNzIiwiYXVkIjoidXNlciIsImV4cCI6MTY1Nzc1MjA0My45NzksImlhdCI6MTY1NTE2MDA0My45NzksImp0aSI6ImRkNGFjZmI1LWVlYTAtNDdjYy1hNjA3LTliMzFjODJkODZlOCIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlcyI6WzFdfQ.Z1_ByfNaFpCUEZCdcpb4LNE7Juqhv_OE851fLHLIGEI",
        expires: 1657752043.979,
        expires_in: 2592000,
      };

      try {
        tokenCreation = await authService.createToken(user, "access");
      } catch (e) {
        tokenCreation = null;
      }
      chai.expect(tokenCreation).to.be.an("object");
      chai.expect(tokenCreation).to.have.keys(Object.keys(expectedToken));
    });

    it("token creation should throw an error because user dosent include its roles.", async () => {
      const user = await User.findOne();
      let tokenCreation;
      const expectedToken: Token = {
        token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic3ViIjoiYWNjZXNzIiwiYXVkIjoidXNlciIsImV4cCI6MTY1Nzc1MjA0My45NzksImlhdCI6MTY1NTE2MDA0My45NzksImp0aSI6ImRkNGFjZmI1LWVlYTAtNDdjYy1hNjA3LTliMzFjODJkODZlOCIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlcyI6WzFdfQ.Z1_ByfNaFpCUEZCdcpb4LNE7Juqhv_OE851fLHLIGEI",
        expires: 1657752043.979,
        expires_in: 2592000,
      };

      try {
        tokenCreation = await authService.createToken(user, "access");
      } catch (e) {
        chai.expect(e).to.be.instanceOf(ReferenceError);
        chai.expect(e.message).to.eql("roles was not included into user.");
      }
    });
  });
  describe("#getCredentials()", () =>{

    it("should not obtain the null credentials", async () => {
      const user = await User.findOne({
        include: [{ model: Role, as: "roles" }],
      });

      let userCredential;
      try {
        userCredential = await authService.getCredentials(user);
      } catch (e) {
        userCredential = null;
      }
      
      chai.assert.isNotNull(userCredential);
    });

    it("token should be an object token type.", async () => {
      const user = await User.findOne({
        include: [{ model: Role, as: "roles" }],
      });
      
      
      let userCredential;
      const expectedToken: AuthCredentials = {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic3ViIjoiYWNjZXNzIiwiYXVkIjoidXNlciIsImV4cCI6MTY1NzgxNjA3NS41NSwiaWF0IjoxNjU1MjI0MDc1LjU1LCJqdGkiOiIyODM2OTYwNy00MWNmLTQ2Y2MtOWFhYy04NWRjYzIwYmE5MTAiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZXMiOlsxXX0.arwSKCYXhBjKW7gcesh7Y05n2zwbDrMkCdtqTQL-pAo',
        expires: 1657816075.55,
        refresh_token: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic3ViIjoicmVmcmVzaCIsImF1ZCI6InVzZXIiLCJleHAiOjE2NzEwMzg4NzUuNTUsImlhdCI6MTY1NTIyNDA3NS41NSwianRpIjoiYzU4Y2QyNDgtNjI5Yi00NmNmLWI5YjktZDRmOTkyOTU3OWYwIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGVzIjpbMV19.pdkHBOHJtg_TSbHATFlFJiej18mCUH12h1O3_Nu-UgE',
          expires: 1671038875.55,
          expires_in: 15814800
        },
        user: { id: 1, name: 'Admin', email: 'admin@example.com' },
        profile: undefined,
        roles: [],
      }
  
      try {
        userCredential = await authService.getCredentials(user);
      } catch (e) {
        userCredential = null;
      }
      chai.expect(userCredential).to.be.an("object");
      chai.expect(userCredential).to.have.keys(Object.keys(expectedToken));
    });

  })

  describe("#createUser", () => {

    it("should not obtain the null credentials", async () => {
      let newUser: User;

      let userCredential;
      try {
        newUser = await onboardingService.createUser( "Jorge",
          "jorge.test@theksquaregroup.com",
          "testpass",
          AuthType.Email,
          "Blancas",
          "Blancas",
        );
      } catch (e) {
        newUser = null;
      }
      
      chai.assert.isNotNull(newUser);
    });

    it("should be user object type", async () => {
      let newUser: User;
      const userCreated: Partial<User> = {
        isActive: false,
        isEmailConfirmed: false,
        id: 2,
        name: 'Luis',
        email: 'luis.test@theksquaregroup.com',
        password: '$2b$10$QqbA.msasnjpF4EYDLaZyeGRRjp7iWwRXGu.X0sjtpXuWDAkGHd.6',
        authType: AuthType.Email,
        firstName: 'Camara',
        lastName: 'Salinas',
      };
      try {
        newUser = await onboardingService.createUser( "Luis",
          "luis.test@theksquaregroup.com",
          "testpass",
          AuthType.Email,
          "Camara",
          "Salinas",
        );
      } catch (e) {        
        newUser = null;
      }
      const userOutput = _.pick(newUser, Object.keys(userCreated))
      chai.expect(newUser).to.be.an("object");
      chai.expect(userOutput).to.have.keys(Object.keys(userCreated));
    });

    it("should throw an Error because its trying to create a new user with an alrready existent user email in db.", async () => {
      let newUser: User;
      try {
        newUser = await onboardingService.createUser( "Luis",
          "luis.test@theksquaregroup.com",
          "testpass",
          AuthType.Email,
          "Camara",
          "Salinas",
        );
      } catch (e) {
        console.log("Error name: ", e.name);
        chai.expect(e).to.be.instanceOf(Object);
      }
      
    });
  })
});