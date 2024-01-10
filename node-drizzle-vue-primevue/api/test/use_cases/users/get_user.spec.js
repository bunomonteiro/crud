const assert = require("assert");

const { getConnectionPool } = require("../../../src/data/database");

const {
  GetUserUseCase,
  GetUserRequest,
} = require("../../../src/use_cases/users/get_user.uc");

describe("Caso de uso: Obter Usuário", () => {
  it("Deve obter o usuário por ´nome de usuário´", async () => {
    // arrange
    const usecase = new GetUserUseCase(getConnectionPool());
    const request = new GetUserRequest();
    request.username = "bruno.monteiro";

    // act
    const response = await usecase.handleAsync(request);

    // assert
    assert(response, "Não teve retorno");
    assert.equal(response.error, null, "Retornou erro");
  });
});
