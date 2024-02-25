//#region
const express = require("express")

const { errorHandler } = require("../middlewares/error.handler")
const { Errors } = require("./../../domain/exceptions/errors")
//#endregion

const router = express.Router()

/**
 * GET
 * get home page
 */
router.get("/", (req, res, next) => {
  try {
    res.render("home/index", {
      page: {
        appAlias: global.configurations.api.alias,
        appName: global.configurations.api.name,
      }
    })
  } catch (error) {
    errorHandler(req, res, Errors.general.unknown(error))
  }
})

module.exports = router;
