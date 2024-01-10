const dotenv = require("dotenv");
const { getConnectionPool } = require("../src/data/database");

exports.mochaHooks = {
  /**
   * one-time before any test starts
   */
  beforeAll: async function () {
    dotenv.config();
  },
  /**
   * one-time after all tests ends
   */
  afterAll: async function () {
    await getConnectionPool().end();
  },
  /**
   * everytime before each test
   */
  beforeEach: async function () { },
  /**
   * everytime after each test
   */
  afterEach: async function () { }
};