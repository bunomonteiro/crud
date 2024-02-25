const assert = require("assert")
const sinon = require('sinon')
const _ = require('lodash')
const Joi = require('joi')

const UserRepository = require('../../../src/adapters/database/repositories/user.repository')
const { getConnectionPool } = require("../../../src/adapters/database/database")

const {
  GetUserUseCase,
  GetUserRequest,
} = require("../../../src/domain/use_cases/users/get_user.uc")

describe("Caso de uso: Obter Usuário", () => {
  let repository

  beforeEach(() => { repository = sinon.spy(new UserRepository(getConnectionPool())) })

  it("Deve obter o usuário por ´nome de usuário´", async () => {
    // arrange
    const usecase = new GetUserUseCase({ Joi }, repository)
    const request = new GetUserRequest()
    request.username = "system";
    const allowedUserProperties = ['id', 'name', 'email', 'username', 'active', 'avatar', 'cover', 'otpEnabled', 'otpVerified']

    // act
    const response = await usecase.handleAsync(request)

    // assert
    assert(response, "Não teve retorno")
    assert.equal(response.error, null, "Retornou erro")
    assert(response.user, "Usuário não retornado")
    assert.equal(response.user.id, 1, "Usuário com 'id' diferente")
    assert.equal(response.user.name, 'System', "Usuário com 'nome' diferente")
    assert.equal(response.user.email, 'system@email.com', "Usuário com 'email' diferente")
    assert.equal(response.user.username, 'system', "Usuário com 'username' diferente")
    assert.equal(response.user.active, true, "Usuário com 'active' diferente")
    assert.equal(response.user.avatar, 'https://avatar.iran.liara.run/public/99', "Usuário com 'avatar' diferente")
    assert.equal(response.user.cover, 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80', "Usuário com 'cover' diferente")
    assert.equal(response.user.otpEnabled, false, "Usuário com 'otpEnabled' diferente")
    assert.equal(response.user.otpVerified, false, "Usuário com 'otpVerified' diferente")
    assert(_.isEmpty(_.omit(response.user, allowedUserProperties)), "Usuário está retornando mais propriedades do que o permitido")
  })
})
