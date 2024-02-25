const assert = require("assert")
const sinon = require('sinon')
const _ = require('lodash')
const Joi = require('joi')

const PasswordService = require('../../../src/adapters/security/password.service')
const { getConnectionPool } = require("../../../src/adapters/database/database")
const UserRepository = require('../../../src/adapters/database/repositories/user.repository')
const {
  CreateUserUseCase,
  CreateUserRequest,
} = require("../../../src/domain/use_cases/users/create_user.uc")

describe("Caso de uso: Criar Usuário", () => {
  let repository
  let passwordServiceSpy

  beforeEach(() => { 
    repository = sinon.spy(new UserRepository(getConnectionPool()))
    passwordServiceSpy = sinon.spy(new PasswordService())
  })

  it("Deve criar o usuário com dados aleatórios", async () => {
    // arrange
    const usecase = new CreateUserUseCase({ Joi }, repository, passwordServiceSpy)
    const request = new CreateUserRequest()
    request.operator = global.configurations.api.users.system.username
    request.avatar = "https://placehold.co/100x100"
    request.cover = "https://placehold.co/900x250"
    request.name = "Usuario Teste 01"
    request.username = "usuario.teste_01"
    request.email = "usuario01@email.com"
    request.password = "A1usuario.teste_01"
    const allowedUserProperties = ['id', 'name', 'email', 'username', 'active', 'avatar', 'cover', 'otpEnabled', 'otpVerified']

    // act
    const response = await usecase.handleAsync(request)

    // assert
    assert(response, "Não teve retorno")
    assert.equal(response.error, null, "Retornou erro")
    assert(response.user, "Não retornou usuário criado")
    assert(response.user.id > 0)
    assert.equal(response.user.avatar, request.avatar)
    assert.equal(response.user.cover, request.cover)
    assert.equal(response.user.name, request.name)
    assert.equal(response.user.email, request.email)
    assert.equal(response.user.username, request.username)
    assert.equal(response.user.active, true)
    assert(passwordServiceSpy.hashAsync.calledOnce, "Não gerou hash da senha")
    assert(_.isEmpty(_.omit(response.user, allowedUserProperties)), "Usuário está retornando mais propriedades do que o permitido")
  })
})
