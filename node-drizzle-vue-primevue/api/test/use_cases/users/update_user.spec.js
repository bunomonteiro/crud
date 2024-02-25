const assert = require("assert")
const sinon = require('sinon')
const _ = require('lodash')
const jsonPatch = require('fast-json-patch')
const Joi = require('joi')

const { getConnectionPool } = require("../../../src/adapters/database/database")
const UserRepository = require('../../../src/adapters/database/repositories/user.repository')
const { UpdateUserUseCase, UpdateUserRequest } = require("../../../src/domain/use_cases/users/update_user.uc")

describe("Caso de uso: Atualizar Usuário", () => {
  let repository

  beforeEach(() => { repository = sinon.spy(new UserRepository(getConnectionPool())) })

  it("Deve atualizar o nome do usuário quando informar o username", async () => {
    // arrange
    const usecase = new UpdateUserUseCase({ Joi, jsonPatch }, repository)
    const request = new UpdateUserRequest()

    request.operator = global.configurations.api.users.system.username
    request.username = 'usuario.teste_1' // from hooks.js
    request.patches = [
      { "op": "replace", "path": "/name", "value": "Novo nome: username" }
    ]

    const allowedUserProperties = ['id', 'name', 'email', 'username', 'active', 'avatar', 'cover', 'otpEnabled', 'otpVerified']

    // act
    const response = await usecase.handleAsync(request)

    // assert
    assert(response, "Não teve retorno")
    assert.equal(response.error, null, "Retornou erro")
    assert(response.user, "Não retornou usuário atualizado")
    assert(repository.updateUser.calledOnce, "Não atualizou")
    assert(response.user.id > 0)
    assert.equal(response.user.name, "Novo nome: username")
    assert(_.isEmpty(_.omit(response.user, allowedUserProperties)), "Usuário está retornando mais propriedades do que o permitido")
  })

  it("Deve atualizar o nome do usuário quando informar o ID", async () => {
    // arrange
    const usecase = new UpdateUserUseCase({ Joi, jsonPatch }, repository)
    const request = new UpdateUserRequest()

    request.operator = global.configurations.api.users.system.username
    request.id = 2
    request.patches = [
      { "op": "replace", "path": "/name", "value": "Novo nome: ID"}
    ]

    const allowedUserProperties = ['id', 'name', 'email', 'username', 'active', 'avatar', 'cover', 'otpEnabled', 'otpVerified']

    // act
    const response = await usecase.handleAsync(request)

    // assert
    assert(response, "Não teve retorno")
    assert.equal(response.error, null, "Retornou erro")
    assert(response.user, "Não retornou usuário atualizado")
    assert(repository.updateUser.calledOnce, "Não atualizou")
    assert(response.user.id > 0)
    assert.equal(response.user.name, "Novo nome: ID")
    assert(_.isEmpty(_.omit(response.user, allowedUserProperties)), "Usuário está retornando mais propriedades do que o permitido")
  })

  it("Não deve atualizar propriedades protegidas", async () => {
    // arrange
    const usecase = new UpdateUserUseCase({ Joi, jsonPatch }, repository)
    const request = new UpdateUserRequest()

    request.operator = global.configurations.api.users.system.username
    request.id = 2
    request.patches = [
      { "op": "replace", "path": "/id", "value": 10000},
      { "op": "replace", "path": "/username", "value": "new.login"},
      { "op": "replace", "path": "/passwordrecoverytoken", "value": "TOKEN"},
      { "op": "replace", "path": "/otpsecret", "value": "OTP SECRET"},
      { "op": "replace", "path": "/otpuri", "value": "OTP URI"},
      { "op": "replace", "path": "/otpenabled", "value": true},
      { "op": "replace", "path": "/otpverified", "value": true}
    ]

    const allowedUserProperties = ['id', 'name', 'email', 'username', 'active', 'avatar', 'cover', 'otpEnabled', 'otpVerified']

    // act
    const response = await usecase.handleAsync(request)

    // assert
    assert(response, "Não teve retorno")
    assert.equal(response.error, null, "Retornou erro")
    assert(response.user, "Não retornou usuário atualizado")
    assert(repository.updateUser.notCalled, "Atualizou indevidamente")
    assert(_.isEmpty(_.omit(response.user, allowedUserProperties)), "Usuário está retornando mais propriedades do que o permitido")
  })
})
