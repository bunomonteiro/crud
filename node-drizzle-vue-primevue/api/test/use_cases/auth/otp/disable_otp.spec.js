const assert = require("assert")
const sinon = require('sinon')
const Joi = require('joi')

const { getConnectionPool } = require("../../../../src/adapters/database/database")
const UserRepository = require('../../../../src/adapters/database/repositories/user.repository')
const { DisableOtpUseCase, DisableOtpRequest } = require("../../../../src/domain/use_cases/auth/otp/disable_otp.uc")

describe("Caso de uso: Desativar 2FA", () => {
  let repository

  beforeEach(() => { repository = new UserRepository(getConnectionPool()) })

  it("Deve desativar 2FA", async () => {
    // arrange
    const original_getUserByUsername = repository.getUserByUsername
    sinon.stub(repository, 'getUserByUsername').callsFake(async (username) => {
      const user = await original_getUserByUsername(username)
      user.otpEnabled = true
      return user
    })
    const updateUserSpy = sinon.spy(repository, 'updateUser')
    const createUserHistorySpy = sinon.spy(repository, 'createUserHistory')
    
    const usecase = new DisableOtpUseCase({ Joi }, repository)
    const request = new DisableOtpRequest()    
    request.username = 'usuario.teste_1'
    
    // act
    const response = await usecase.handleAsync(request)

    // assert
    assert(response, "Não teve retorno")
    assert.equal(response.error, null, "Retornou erro")
    assert(repository.getUserByUsername.calledOnce, "Não consultou o usuário")
    assert(updateUserSpy.calledOnce, "Não atualizou o usuário")
    assert.equal(updateUserSpy.getCall(0).args[0].otpEnabled, false, "Não desativou a 2FA")
    assert(createUserHistorySpy.calledOnce, "Não registrou o histórico")
  })

  it("Deve retornar erro quando tentar desativar 2FA de usuário inexistente", async () => {
    // arrange
    const getUserByUsernameSpy = sinon.spy(repository, 'getUserByUsername')
    const updateUserSpy = sinon.spy(repository, 'updateUser')
    const createUserHistorySpy = sinon.spy(repository, 'createUserHistory')
    
    const usecase = new DisableOtpUseCase({ Joi }, repository)
    const request = new DisableOtpRequest()    
    request.username = 'XPTO'
    
    // act
    const response = await usecase.handleAsync(request)

    // assert
    assert(response, "Não teve retorno")
    assert(response.error, "Não retornou erro")
    assert(response.message, "Não retornou mensagem")
    assert(getUserByUsernameSpy.calledOnce, "Não consultou usuário")
    assert(updateUserSpy.notCalled, "Atualizou indevidamente")
    assert(createUserHistorySpy.notCalled, "Registrou histórico desnecessariamente")
  })

  it("Deve retornar erro quando não informar um nome de usuário", async () => {
    // arrange
    const getUserByUsernameSpy = sinon.spy(repository, 'getUserByUsername')
    const updateUserSpy = sinon.spy(repository, 'updateUser')
    const createUserHistorySpy = sinon.spy(repository, 'createUserHistory')
    
    const usecase = new DisableOtpUseCase({ Joi }, repository)
    const request = new DisableOtpRequest()    
    request.username = ''
    
    // act
    const response = await usecase.handleAsync(request)

    // assert
    assert(response, "Não teve retorno")
    assert(response.error, "Não retornou erro")
    assert(response.message, "Não retornou mensagem")
    assert(getUserByUsernameSpy.notCalled, "Consultou usuário desnecessariamente")
    assert(updateUserSpy.notCalled, "Atualizou indevidamente")
    assert(createUserHistorySpy.notCalled, "Registrou histórico desnecessariamente")
  })
})
