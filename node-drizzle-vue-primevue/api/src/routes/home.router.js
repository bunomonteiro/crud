//#region
const express = require("express");

const { errorHandler, Errors } = require("../common/errors.helper");
const configurations = require('../services/configurations/configuration.service')
//#endregion

const router = express.Router();

/**
 * GET
 * get home page
 */
router.get("/", (req, res, next) => {
  try {
    res.render("home/index", {
      page: {
        appAlias: configurations.api.alias,
        appName: configurations.api.name,
      }
    });
  } catch (error) {
    errorHandler(req, res, Errors.general.unknown(error));
  }
});

module.exports = router;
