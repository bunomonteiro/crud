const assert = require("assert")
const sinon = require('sinon')
const _ = require('lodash')
const Joi = require('joi')


const PasswordService = require('../../../src/adapters/security/password.service')
const UserRepository = require('../../../src/adapters/database/repositories/user.repository')
const { CreateUserUseCase, CreateUserRequest } = require("../../../src/domain/use_cases/users/create_user.uc")
const { UserModel } = require("../../../src/domain/entities/user.aggregate")

describe("Caso de uso: Criar Usuário", () => {
  let repositoryMock
  let passwordServiceSpy

  beforeEach(() => { 
    repositoryMock = sinon.mock(new UserRepository(sinon.stub()))
    passwordServiceSpy = sinon.spy(new PasswordService())
  })
  afterEach(() => { sinon.restore() })

  it("Deve retornar uma resposta de sucesso com detalhes do usuário quando a requisição for válida", async () => {
    // arrange
    const request = new CreateUserRequest()
    request.operator = global.configurations.api.users.system.username
    request.avatar = "https://placehold.co/100x100"
    request.cover = "https://placehold.co/900x250"
    request.name = "Usuario Teste 01"
    request.username = "usuario.teste_01"
    request.email = "usuario01@email.com"
    request.password = "A1usuario.teste_01"
    const allowedUserProperties = ['id', 'name', 'email', 'username', 'active', 'avatar', 'cover', 'otpEnabled', 'otpVerified']

    // mocking repository methods
    repositoryMock.expects('createUser').returns(new UserModel({
      id: 2,
      name: request.name,
      username: request.username,
      email: request.email,
      avatar: request.avatar,
      cover: request.cover,
      active: true,
      otpEnabled: true,
      otpVerified: true,
      password: request.password,
      otpSecret: 'otpSecret',
      otpUri: 'otpUri',
      passwordRecoveryToken: 'passwordRecoveryToken'
    }))
    
    repositoryMock.expects('getUserByUsername').returns(new UserModel({
      id: 1
    }))

    const createdUserHistory = repositoryMock.expects('createUserHistory').once()
    
    const usecase = new CreateUserUseCase({ Joi }, repositoryMock.object, passwordServiceSpy)

    // act
    const response = await usecase.handleAsync(request)

    // assert
    assert(response, "Não teve retorno")
    assert.equal(response.error, null, "Retornou erro")
    assert(response.user, "Não retornou usuário criado")
    assert(_.isEmpty(_.omit(response.user, allowedUserProperties)), "Usuário está retornando mais propriedades do que o permitido")
    assert.equal(response.user.id, 2)
    assert.equal(response.user.avatar, request.avatar)
    assert.equal(response.user.cover, request.cover)
    assert.equal(response.user.fullname, request.fullname)
    assert.equal(response.user.username, request.username)
    assert.equal(response.user.active, true)
    assert(passwordServiceSpy.hashAsync.calledOnce, "Não gerou hash da senha")
    assert(createdUserHistory.verify(), "Não registrou o histórico")
  })
})
