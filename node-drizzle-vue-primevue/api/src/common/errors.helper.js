const status = require("http-status");

const Errors = {
  general: {
    unknown: (error, status = 500) => ({ code: "00X000000", message: "Ocorreu um erro desconhecido", status: status, originalError: error }),
  },
  /* ################################ */
  auth: {
    signin: (error, status = 401) => ({code: "01X000001", message: "Não foi possível fetuar o acesso", status: status, originalError: error }),
    signup: (error, status = 500) => ({code: "01X000002", message: "Não foi possível completar o cadastro", status: status, originalError: error }),
    requestPasswordRecovery: (error, status = 401) => ({code: "01X000003", message: "Não foi possível completar a solicitação de recuperação de senha", status: status, originalError: error }),
    changePassword: (error, status = 401) => ({code: "01X000004", message: "Não foi possível alterar a senha", status: status, originalError: error }),
    generateOTP: (error, status = 403) => ({code: "01X000005", message: "Não foi possível criar o código OTP", status: status, originalError: error }),
    verifyOTP: (error, status = 403) => ({code: "01X000006", message: "Não foi possível verificar o código OTP", status: status, originalError: error }),
    validateOTP: (error, status = 403) => ({code: "01X000007", message: "Não foi possível validar o código OTP", status: status, originalError: error }),
    disableOTP: (error, status = 403) => ({code: "01X000008", message: "Não foi possível desabilitar OTP", status: status, originalError: error }),
    //--
    unauthorizedToken: (error, status = 403) => ({code: "01X000009", message: "Token de acesso não autorizado", status: status, originalError: error }),
    tokenValidation: (error, status = 403) => ({code: "01X000010", message: "Token de acesso inválido", status: status, originalError: error }),
    tokenRequired: (error, status = 403) => ({code: "01X000011", message: "Token de acesso ausente", status: status, originalError: error }),
    otpRequired: (error, status = 403) => ({code: "01X000012", message: "Necessário habilitar autenticação em duas etapas com OTP", status: status, originalError: error }),
    verifiedOtpRequired: (error, status = 403) => ({code: "01X000013", message: "Necessário validar o OTP", status: status, originalError: error }),
  },
  users: {
    getUser: (error, status = 500) => ({code: "04X000001", message: "Não foi possível consultar o usuário", status: status, originalError: error }),
    listUsers: (error, status = 500) => ({code: "04X000002", message: "Não foi possível listar os usuários", status: status, originalError: error }),
    createUser: (error, status = 500) => ({code: "04X000003", message: "Não foi possível criar o usuário", status: status, originalError: error }),
    updateUser: (error, status = 500) => ({code: "04X000004", message: "Não foi possível atualizar o usuário", status: status, originalError: error }),
  },
}

function errorHandler(_req, res, error) {
  error = error || Errors.general.unknown(error);
  console.error(`[ERROR]`, error);

  res.status(error?.status || res.locals?.error?.status || status.INTERNAL_SERVER_ERROR)
    .json({
      error: error?.code,
      message: error?.message
    })
    .end();
}

module.exports = {
  Errors,
  errorHandler
};