const assert = require("assert")
const sinon = require('sinon')
const _ = require("lodash")
const Joi = require("joi")

const { getConnectionPool } = require("../../../src/adapters/database/database")
const UserRepository = require('../../../src/adapters/database/repositories/user.repository')

const { ListUserHistoriesUseCase, ListUserHistoriesRequest } = require("../../../src/domain/use_cases/users/list_user_histories.uc")

describe("Caso de uso: Listar HIstóricos de Usuários", () => {
  let repository

  beforeEach(() => { repository = sinon.spy(new UserRepository(getConnectionPool())) })

  it("Deve obter uma lista de históricos de usuários", async () => {
    // arrange
    const usecase = new ListUserHistoriesUseCase({ Joi }, repository)
    const request = new ListUserHistoriesRequest()
    const allowedUserProperties = ['id', 'name', 'username', 'avatar']
    const allowedOperatorProperties = ['id', 'name', 'username', 'avatar']

    // act
    const response = await usecase.handleAsync(request)

    // assert
    assert(response, "Não teve retorno")
    assert.equal(response.error, null, "Retornou erro")
    assert.equal(response.message, null)
    assert.equal(response.currentPage, 0) // página padrão
    assert.equal(response.pageSize, 10) // tamanho padrão
    assert(response.totalRows > 0)
    assert(response.userHistories, "Não retornou usuário")
    response.userHistories.forEach(history => {
      assert(_.isEmpty(_.omit(history.user, allowedUserProperties)), "Usuário está retornando mais propriedades do que o permitido")
      assert(_.isEmpty(_.omit(history.operator, allowedOperatorProperties)), "Operador está retornando mais propriedades do que o permitido")
    })
  })
})
