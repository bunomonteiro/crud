const assert = require("assert")
const sinon = require('sinon')
const _ = require('lodash')
const Joi = require('joi')
const jwt = require("jsonwebtoken")

const PasswordService = require('../../../src/adapters/security/password.service')
const { getConnectionPool } = require("../../../src/adapters/database/database")
const UserRepository = require('../../../src/adapters/database/repositories/user.repository')
const { DoLoginUseCase, DoLoginRequest } = require("../../../src/domain/use_cases/auth/do_login.uc")

describe("Caso de uso: Efetuar Login", () => {
  let repository
  let passwordServiceSpy

  beforeEach(() => { 
    repository = sinon.spy(new UserRepository(getConnectionPool())) 
    passwordServiceSpy = sinon.spy(new PasswordService())
  })

  it("Deve efetuar login", async () => {
    // arrange
    const usecase = new DoLoginUseCase({ Joi, jwt }, repository, passwordServiceSpy)
    const request = new DoLoginRequest()

    request.username = 'usuario.teste_2' // from hooks.js
    request.password = 'A1usuario.teste_2' // from hooks.js
    
    const allowedUserProperties = ['id', 'name', 'email', 'username', 'active', 'avatar', 'cover', 'otpEnabled', 'otpVerified', 'otpValidated']

    // act
    const response = await usecase.handleAsync(request)

    // assert
    assert(response, "Não teve retorno")
    assert.equal(response.error, null, "Retornou erro")
    assert(response.token, "Não retornou token")
    assert(passwordServiceSpy.compareAsync.calledOnce, "Não comparou a senha")
    assert(repository.createUserHistory.calledOnce, "Não registrou histórico")
    const decodedToken = jwt.decode(response.token)
    assert(decodedToken.user, "Usuário não injetado no token")
    assert(_.isEmpty(_.omit(decodedToken.user, allowedUserProperties)), "Usuário está retornando mais propriedades do que o permitido")
  })
  
  it("Deve rejeitar acesso quando credencial invalida", async () => {
    // arrange
    const usecase = new DoLoginUseCase({ Joi, jwt }, repository, passwordServiceSpy)
    const request = new DoLoginRequest()

    request.username = 'usuario.xpto'
    request.password = 'A1usuario.teste_1' // from hooks.js

    // act
    const response = await usecase.handleAsync(request)

    // assert
    assert(response, "Não teve retorno")
    assert(response.error, "Não retornou erro")
    assert(response.message, "Não retornou mensagem")
    assert.equal(response.token, null, "Retornou token")
    assert(passwordServiceSpy.compareAsync.notCalled, "Comparou senha desnecessariamente")
    assert(repository.createUserHistory.notCalled, "Registrou histórico")
  })

  it("Deve rejeitar acesso quando senha invalida", async () => {
    // arrange
    const usecase = new DoLoginUseCase({ Joi, jwt }, repository, passwordServiceSpy)
    const request = new DoLoginRequest()

    request.username = 'usuario.teste_1' // from hooks.js
    request.password = 'senha.xpto'

    // act
    const response = await usecase.handleAsync(request)

    // assert
    assert(response, "Não teve retorno")
    assert(response.error, "Não retornou erro")
    assert(response.message, "Não retornou mensagem")
    assert.equal(response.token, null, "Retornou token")
    assert(passwordServiceSpy.compareAsync.calledOnce, "Não comparou a senha")
    assert(repository.createUserHistory.notCalled, "Registrou histórico")
  })
})
