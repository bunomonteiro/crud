const assert = require("assert");

const { getConnectionPool } = require("../../../src/data/database");

const { ListUsersUseCase, ListUsersRequest } = require("../../../src/use_cases/users/list_users.uc");

describe("Caso de uso: Listar Usuários", () => {
  it("Deve obter uma lista de usuáriso", async () => {
    // arrange
    const usecase = new ListUsersUseCase(getConnectionPool());
    const request = new ListUsersRequest();

    // act
    const response = await usecase.handleAsync(request);

    // assert
    assert(response, "Não teve retorno");
    assert.equal(response.error, null, "Retornou erro");
  });
});
