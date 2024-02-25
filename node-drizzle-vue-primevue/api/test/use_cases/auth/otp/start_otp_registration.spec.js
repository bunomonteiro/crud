const assert = require("assert")
const Joi = require("joi")
const crypto = require("crypto")
const OTPAuth = require("otpauth")
const sinon = require("sinon")

const UserRepository = require("../../../../src/adapters/database/repositories/user.repository")
const { getConnectionPool } = require("../../../../src/adapters/database/database")
const { StartOtpRegistrationUseCase, StartOtpRegistrationRequest } = require("../../../../src/domain/use_cases/auth/otp/start_otp_registration.uc")

describe("Caso de uso: Iniciar registro da 2FA", () => {
  let repository

  beforeEach(() => { repository = new UserRepository(getConnectionPool()) })

  it("Deve iniciar registro da 2FA", async () => {
    // arrange
    const getUserByUsernameSpy = sinon.spy(repository, 'getUserByUsername')
    const updateUserSpy = sinon.spy(repository, 'updateUser')
    const createUserHistorySpy = sinon.spy(repository, 'createUserHistory')

    const usecase = new StartOtpRegistrationUseCase({ crypto, Joi, OTPAuth }, repository)
    const request = new StartOtpRegistrationRequest()
    request.username = 'usuario.teste_2'

    // act
    const response = await usecase.handleAsync(request)

    // assert
    assert(response, "Não teve retorno")
    assert.equal(response.error, null, "Retornou erro")
    assert(getUserByUsernameSpy.calledOnce, "Não consultou usuário")
    assert(updateUserSpy.calledOnce, "Não atualizou usuário")
    assert(updateUserSpy.getCall(0).args[0].otpSecret, "Não registrou o segredo")
    assert(updateUserSpy.getCall(0).args[0].otpUri, "Não registrou a URI/QrCode")
    assert(!updateUserSpy.getCall(0).args[0].otpEnabled, "Não desativou 2FA")
    assert(!updateUserSpy.getCall(0).args[0].otpVerified, "Não desligou a verificação 2FA")
    assert(createUserHistorySpy.calledOnce, "Não registrou histórico")
  })

  it("Não deve registrar da 2FA quando usuário não existir", async () => {
    // arrange
    const getUserByUsernameSpy = sinon.spy(repository, 'getUserByUsername')
    const updateUserSpy = sinon.spy(repository, 'updateUser')
    const createUserHistorySpy = sinon.spy(repository, 'createUserHistory')

    const usecase = new StartOtpRegistrationUseCase({ crypto, Joi, OTPAuth }, repository)
    const request = new StartOtpRegistrationRequest()
    request.username = 'usuario.inexistente'

    // act
    const response = await usecase.handleAsync(request)

    // assert
    assert(response, "Não teve retorno")
    assert(response.error, "Não retornou erro")
    assert(response.message, "Não retornou mensagem")
    assert(getUserByUsernameSpy.calledOnce, "Não consultou usuário")
    assert(updateUserSpy.notCalled, "Atualizou usuário indevidamente")
    assert(createUserHistorySpy.notCalled, "Registrou histórico desnecessariamente")
  })

  it("Não deve registrar da 2FA quando usuário já tiver 2FA habilitado", async () => {
    // arrange
    const original_getUserByUsername = repository.getUserByUsername
    sinon.stub(repository, 'getUserByUsername').callsFake(async (username) => {
      const user = await original_getUserByUsername(username)
      user.otpEnabled = true
      user.otpVerified = false
      return user
    })
    const updateUserSpy = sinon.spy(repository, 'updateUser')
    const createUserHistorySpy = sinon.spy(repository, 'createUserHistory')

    const usecase = new StartOtpRegistrationUseCase({ crypto, Joi, OTPAuth }, repository)
    const request = new StartOtpRegistrationRequest()
    request.username = 'usuario.teste_2'

    // act
    const response = await usecase.handleAsync(request)

    // assert
    assert(response, "Não teve retorno")
    assert(response.error, "Não retornou erro")
    assert(response.message, "Não retornou mensagem")
    assert(repository.getUserByUsername.calledOnce, "Não consultou usuário")
    assert(updateUserSpy.notCalled, "Atualizou usuário indevidamente")
    assert(createUserHistorySpy.notCalled, "Registrou histórico desnecessariamente")
  })

  it("Não deve registrar da 2FA quando usuário já tiver 2FA verificado", async () => {
    // arrange
    const original_getUserByUsername = repository.getUserByUsername
    sinon.stub(repository, 'getUserByUsername').callsFake(async (username) => {
      const user = await original_getUserByUsername(username)
      user.otpEnabled = false
      user.otpVerified = true
      return user
    })
    const updateUserSpy = sinon.spy(repository, 'updateUser')
    const createUserHistorySpy = sinon.spy(repository, 'createUserHistory')

    const usecase = new StartOtpRegistrationUseCase({ crypto, Joi, OTPAuth }, repository)
    const request = new StartOtpRegistrationRequest()
    request.username = 'usuario.teste_2'

    // act
    const response = await usecase.handleAsync(request)

    // assert
    assert(response, "Não teve retorno")
    assert(response.error, "Não retornou erro")
    assert(response.message, "Não retornou mensagem")
    assert(repository.getUserByUsername.calledOnce, "Não consultou usuário")
    assert(updateUserSpy.notCalled, "Atualizou usuário indevidamente")
    assert(createUserHistorySpy.notCalled, "Registrou histórico desnecessariamente")
  })

  it("Não deve registrar da 2FA quando não informar o nome de usuário", async () => {
    // arrange
    const getUserByUsernameSpy = sinon.spy(repository, 'getUserByUsername')
    const updateUserSpy = sinon.spy(repository, 'updateUser')
    const createUserHistorySpy = sinon.spy(repository, 'createUserHistory')

    const usecase = new StartOtpRegistrationUseCase({ crypto, Joi, OTPAuth }, repository)
    const request = new StartOtpRegistrationRequest()
    request.username = ''

    // act
    const response = await usecase.handleAsync(request)

    // assert
    assert(response, "Não teve retorno")
    assert(response.error, "Não retornou erro")
    assert(response.message, "Não retornou mensagem")
    assert(getUserByUsernameSpy.notCalled, "Consultou usuário desnecessariamente")
    assert(updateUserSpy.notCalled, "Atualizou usuário indevidamente")
    assert(createUserHistorySpy.notCalled, "Registrou histórico desnecessariamente")
  })
})