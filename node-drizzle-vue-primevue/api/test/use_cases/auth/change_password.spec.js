const assert = require("assert")
const path = require('path')
const sinon = require('sinon')
const Joi = require('joi')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
dayjs.extend(utc)

const CryptService = require('../../../src/adapters/security/encryption.service')
const PasswordService = require('../../../src/adapters/security/password.service')
const EmailService = require('../../../src/adapters/network/email.service')
const { getConnectionPool } = require("../../../src/adapters/database/database")
const UserRepository = require('../../../src/adapters/database/repositories/user.repository')
const { ChangePasswordUseCase, ChangePasswordRequest } = require("../../../src/domain/use_cases/auth/change_password.uc")

describe("Caso de uso: Atualizar senha", () => {
  let repository
  let cryptServiceSpy
  let passwordServiceSpy
  let emailServiceSpy

  beforeEach(() => { 
    repository = new UserRepository(getConnectionPool())
    cryptServiceSpy = sinon.spy(new CryptService())
    passwordServiceSpy = sinon.spy(new PasswordService())
    emailServiceSpy = sinon.spy(new EmailService())
  })

  it("Deve atualizar a senha do usuário", async () => {
    // arrange
    const token = cryptServiceSpy.encrypt(JSON.stringify({username: 'usuario.teste_1', moment: dayjs.utc().add(60, 'minute').valueOf() }))
    const original_getUserByUsername = repository.getUserByUsername
    sinon.stub(repository, 'getUserByUsername').callsFake(async (username) => {
      const user = await original_getUserByUsername(username)
      user.passwordRecoveryToken = token
      return user
    })
    const updateUserSpy = sinon.spy(repository, 'updateUser')
    const createUserHistorySpy = sinon.spy(repository, 'createUserHistory')


    const usecase = new ChangePasswordUseCase({ dayjs, Joi, path }, repository, cryptServiceSpy, passwordServiceSpy, emailServiceSpy)
    const request = new ChangePasswordRequest()
    
    request.token = token
    request.password = 'A1@novasenha'
    
    // act
    const response = await usecase.handleAsync(request)

    // assert
    assert(response, "Não teve retorno")
    assert.equal(response.error, null, "Retornou erro")
    assert(cryptServiceSpy.decrypt.calledOnce, "Não descriptografou o token")
    assert(repository.getUserByUsername.calledOnce, "Não consultou o usuário")
    assert(updateUserSpy.calledOnce, 'Não atualizou o usuário')
    assert(createUserHistorySpy.calledOnce, 'Não registrou o histórico')
    assert(emailServiceSpy.sendAsync.calledOnce, "Não enviou email")
  })

  it("Não deve atualizar a senha do usuário quando não informar senha", async () => {
    // arrange
    const token = cryptServiceSpy.encrypt(JSON.stringify({username: 'usuario.teste_1', moment: dayjs.utc().add(60, 'minute').valueOf() }))
    const getUserByUsernameSpy = sinon.spy(repository, 'getUserByUsername')
    const updateUserSpy = sinon.spy(repository, 'updateUser')
    const createUserHistorySpy = sinon.spy(repository, 'createUserHistory')

    const usecase = new ChangePasswordUseCase({ dayjs, Joi, path }, repository, cryptServiceSpy, passwordServiceSpy, emailServiceSpy)
    const request = new ChangePasswordRequest()
    
    request.token = token
    
    // act
    const response = await usecase.handleAsync(request)

    // assert
    assert(response, "Não teve retorno")
    assert(response.error,"Não retornou erro")
    assert(getUserByUsernameSpy.notCalled, "Consultou usuário desnecessariamente")
    assert(updateUserSpy.notCalled, "Atualizou usuário indevidamente")
    assert(createUserHistorySpy.notCalled, "Criou histórico desnecessariamente")
    assert(cryptServiceSpy.decrypt.notCalled, "Descriptografou o token desnecessariamente")
    assert(emailServiceSpy.sendAsync.notCalled, "Enviou email desnecessariamente")
  })

  it("Não deve atualizar a senha do usuário quando não informar token", async () => {
    // arrange
    const getUserByUsernameSpy = sinon.spy(repository, 'getUserByUsername')
    const updateUserSpy = sinon.spy(repository, 'updateUser')
    const createUserHistorySpy = sinon.spy(repository, 'createUserHistory')

    const usecase = new ChangePasswordUseCase({ dayjs, Joi, path }, repository.object, cryptServiceSpy, passwordServiceSpy, emailServiceSpy)
    const request = new ChangePasswordRequest()
    
    request.password = 'A1@novasenha'

    // act
    const response = await usecase.handleAsync(request)

    // assert
    assert(response, "Não teve retorno")
    assert(response.error,"Não retornou erro")
    assert(getUserByUsernameSpy.notCalled, "Consultou usuário desnecessariamente")
    assert(updateUserSpy.notCalled, "Atualizou usuário indevidamente")
    assert(createUserHistorySpy.notCalled, "Criou histórico desnecessariamente")
    assert(cryptServiceSpy.decrypt.notCalled, "Descriptografou o token desnecessariamente")
    assert(emailServiceSpy.sendAsync.notCalled, "Enviou email desnecessariamente")
  })

  it("Não deve atualizar a senha do usuário quando token estiver vencido", async () => {
    // arrange
    const token = cryptServiceSpy.encrypt(JSON.stringify({username: 'usuario.teste_1', moment: dayjs.utc().add(-1, 'second').valueOf() }))
    const getUserByUsernameSpy = sinon.spy(repository, 'getUserByUsername')
    const updateUserSpy = sinon.spy(repository, 'updateUser')
    const createUserHistorySpy = sinon.spy(repository, 'createUserHistory')

    const usecase = new ChangePasswordUseCase({ dayjs, Joi, path }, repository.object, cryptServiceSpy, passwordServiceSpy, emailServiceSpy)
    const request = new ChangePasswordRequest()
    
    request.token = token
    request.password = 'A1@novasenha'
    
    // act
    const response = await usecase.handleAsync(request)

    // assert
    assert(response, "Não teve retorno")
    assert(response.error, "Não retornou erro")
    assert(getUserByUsernameSpy.notCalled, "Consultou usuário desnecessariamente")
    assert(updateUserSpy.notCalled, "Atualizou usuário indevidamente")
    assert(createUserHistorySpy.notCalled, "Criou histórico desnecessariamente")
    assert(cryptServiceSpy.decrypt.calledOnce, "Não descriptografou o token")
    assert(emailServiceSpy.sendAsync.notCalled, "Enviou email")
  })
})
