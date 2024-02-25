const path = require('path')
const dotenv = require("dotenv")
const childProcess = require('child_process');
const Joi = require('joi');

const PasswordService = require('../src/adapters/security/password.service')
const { getConnectionPool } = require("../src/adapters/database/database")
const UserRepository = require('../src/adapters/database/repositories/user.repository')
const { CreateUserUseCase, CreateUserRequest } = require('../src/domain/use_cases/users/create_user.uc');
const configurations = require('../src/shared/configurations');

function databaseReset() {
  const dbProjectPath = path.resolve(__dirname, '../../db') // Caminho relativo ao projeto de banco de dados
  const dbProjectEnv = {
    FLYWAY_DB_URL: process.env.TEST_DB_URL,
    FLYWAY_DB_SCHEMAS: process.env.TEST_DB_SCHEMAS,
    FLYWAY_DB_USER: process.env.TEST_DB_USER,
    FLYWAY_DB_PASS: process.env.TEST_DB_PASS
  }

  console.log('[TEST INIT] Limpando o banco de dados...')
  childProcess.execSync('npm run clean', { env: dbProjectEnv, cwd: dbProjectPath })
  console.log('[TEST INIT] Inicializando o banco de dados...')
  childProcess.execSync('npm run migrate', { env: dbProjectEnv, cwd:dbProjectPath })
}

async function createABunchOfUsers(total = 25) {
  console.log('[TEST INIT] Criando usuários')
  const usecase = new CreateUserUseCase({ Joi }, new UserRepository(getConnectionPool()), new PasswordService())

  for (let index = 0; index < total; index++) {
    await usecase.handleAsync(new CreateUserRequest({
      operator: global.configurations.api.users.system.username,
      avatar: "https://placehold.co/100x100",
      cover: "https://placehold.co/900x250",
      name: `Usuario Teste ${index + 1}`,
      username: `usuario.teste_${index + 1}`,
      email: `usuario${index + 1}@email.com`,
      password: `A1usuario.teste_${index + 1}`
    }))
  }
}

exports.mochaHooks = {
  /**
   * one-time before any test starts
   */
  beforeAll: async function () {
    dotenv.config({ path: '.env.test', override: true })
    configurations.load()
   
    databaseReset()
    await createABunchOfUsers()
  },
  /**
   * one-time after all tests ends
   */
  afterAll: async function () {
    // await getConnectionPool().end()
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