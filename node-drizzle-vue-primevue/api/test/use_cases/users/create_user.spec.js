const assert = require("assert");
const { v4: guid } = require('uuid');

const { getConnectionPool } = require("../../../src/data/database");
const {
  CreateUserUseCase,
  CreateUserRequest,
} = require("../../../src/use_cases/users/create_user.uc");

describe("Caso de uso: Criar Usuário", () => {
  it("Deve criar o usuário com dados aleatórios", async () => {
    // arrange
    const usecase = new CreateUserUseCase(getConnectionPool());
    const request = new CreateUserRequest();
    request.avatar = "https://placehold.co/100x100";
    request.cover = "https://placehold.co/900x250";
    request.name = "[TEST] Full Name";
    request.username = "[TEST] Login";
    request.password = "[TEST] Pass";

    // act
    const response = await usecase.handleAsync(request);

    // assert
    assert(response, "Não teve retorno");
    assert.equal(response.error, null, "Retornou erro");
    assert(response.user, "Não retornou usuário criado");
    assert(response.user.id > 0);
    assert.equal(response.user.avatar, request.avatar);
    assert.equal(response.user.cover, request.cover);
    assert.equal(response.user.fullname, request.fullname);
    assert.equal(response.user.password, null, "Não deveria retornar o hash da senha");
    assert.equal(response.user.username, request.username);
    assert.equal(response.user.active, true);
    assert.equal(response.user.updatedAt, null, "Não deveria retornar data de atualização");
  });
});
