const assert = require("assert")
const sinon = require('sinon')
const _ = require("lodash")
const Joi = require("joi")

const { getConnectionPool } = require("../../../src/adapters/database/database")
const UserRepository = require('../../../src/adapters/database/repositories/user.repository')

const { ListUsersUseCase, ListUsersRequest } = require("../../../src/domain/use_cases/users/list_users.uc")

describe("Caso de uso: Listar Usuários", () => {
  let repository

  beforeEach(() => { repository = sinon.spy(new UserRepository(getConnectionPool())) })

  it("Deve obter uma lista de usuários", async () => {
    // arrange
    const usecase = new ListUsersUseCase({ Joi }, repository)
    const request = new ListUsersRequest()
    const allowedUserProperties = ['id', 'name', 'email', 'username', 'active', 'avatar', 'cover', 'otpEnabled', 'otpVerified']

    // act
    const response = await usecase.handleAsync(request)

    // assert
    assert(response, "Não teve retorno")
    assert.equal(response.error, null, "Retornou erro")
    assert.equal(response.message, null)
    assert.equal(response.currentPage, 0) // página padrão
    assert.equal(response.pageSize, 10) // tamanho padrão
    assert(response.totalRows > 0)
    assert(response.users, "Não retornou usuário")
    response.users.forEach(user => {
      assert(_.isEmpty(_.omit(user, allowedUserProperties)), "Usuário está retornando mais propriedades do que o permitido")
    })
  })
})
