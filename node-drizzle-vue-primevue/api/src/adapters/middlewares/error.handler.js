const status = require("http-status")

const { Errors } = require("./../../domain/exceptions/errors")

function errorHandler(_req, res, error) {
  error = error || Errors.general.unknown(error)
  console.error(`[ERROR]`, error)

  res.status(error?.status || res.locals?.error?.status || status.INTERNAL_SERVER_ERROR)
    .json({
      error: error?.code,
      message: error?.message
    })
    .end()
}

module.exports = {
  errorHandler
};