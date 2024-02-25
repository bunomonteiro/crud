const assert = require("assert")
const Joi = require("joi")
const sinon = require("sinon")

const UserRepository = require("../../../../src/adapters/database/repositories/user.repository")
const { getConnectionPool } = require("../../../../src/adapters/database/database")
const { GetOtpUriUseCase, GetOtpUriRequest } = require("../../../../src/domain/use_cases/auth/otp/get_otp_uri.uc")

describe("Caso de uso: Obter QrCode 2FA", () => {
  let repository

  beforeEach(() => { repository = new UserRepository(getConnectionPool()) })

  it("Deve obter QrCode 2FA", async () => {
    // arrange
    const otpUri = 'OTP URI'
    const original_getUserByUsername = repository.getUserByUsername
    sinon.stub(repository, 'getUserByUsername').callsFake(async (username) => {
      const user = await original_getUserByUsername(username)
      user.otpEnabled = true
      user.otpVerified = true
      user.otpUri = otpUri
      return user
    })
    const createUserHistorySpy = sinon.spy(repository, 'createUserHistory')

    const usecase = new GetOtpUriUseCase({ Joi }, repository)
    const request = new GetOtpUriRequest()
    request.username = 'usuario.teste_1'

    // act
    const response = await usecase.handleAsync(request)

    // assert
    assert(response, "Não teve retorno")
    assert.equal(response.error, null, "Retornou erro")
    assert.equal(response.tokenUri, otpUri, "Token inválido")
    assert(createUserHistorySpy.calledOnce, "Não registrou histórico")
  })

  it("Deve retornar erro quando o 2FA não estiver verificado", async () => {
    // arrange
    const otpUri = 'OTP URI'
    const original_getUserByUsername = repository.getUserByUsername
    sinon.stub(repository, 'getUserByUsername').callsFake(async (username) => {
      const user = await original_getUserByUsername(username)
      user.otpEnabled = true
      user.otpVerified = false
      user.otpUri = otpUri
      return user
    })
    const createUserHistorySpy = sinon.spy(repository, 'createUserHistory')

    const usecase = new GetOtpUriUseCase({ Joi }, repository)
    const request = new GetOtpUriRequest()
    request.username = 'usuario.teste_1'

    // act
    const response = await usecase.handleAsync(request)

    // assert
    assert(response, "Não teve retorno")
    assert(response.error, "Não retornou erro")
    assert(response.message, "Não retornou mensagem")
    assert(createUserHistorySpy.calledOnce, "Não registrou histórico")
  })

  it("Deve retornar erro quando o 2FA não estiver habilitado", async () => {
    // arrange
    const otpUri = 'OTP URI'
    const original_getUserByUsername = repository.getUserByUsername
    sinon.stub(repository, 'getUserByUsername').callsFake(async (username) => {
      const user = await original_getUserByUsername(username)
      user.otpEnabled = false
      user.otpVerified = true
      user.otpUri = otpUri
      return user
    })
    const createUserHistorySpy = sinon.spy(repository, 'createUserHistory')

    const usecase = new GetOtpUriUseCase({ Joi }, repository)
    const request = new GetOtpUriRequest()
    request.username = 'usuario.teste_1'

    // act
    const response = await usecase.handleAsync(request)

    // assert
    assert(response, "Não teve retorno")
    assert(response.error, "Não retornou erro")
    assert(response.message, "Não retornou mensagem")
    assert(createUserHistorySpy.calledOnce, "Não registrou histórico")
  })

  it("Deve retornar erro quando usuário não existir", async () => {
    // arrange
    const getUserByUsernameSpy = sinon.spy(repository, 'getUserByUsername')
    const createUserHistorySpy = sinon.spy(repository, 'createUserHistory')

    const usecase = new GetOtpUriUseCase({ Joi }, repository)
    const request = new GetOtpUriRequest()
    request.username = 'usuario.inexistente'

    // act
    const response = await usecase.handleAsync(request)

    // assert
    assert(response, "Não teve retorno")
    assert(response.error, "Não retornou erro")
    assert(response.message, "Não retornou mensagem")
    assert(getUserByUsernameSpy.calledOnce, "Não consultou usuário")
    assert(createUserHistorySpy.notCalled, "Registrou histórico desnecessariamente")
  })
})