//#region
const express = require("express");
const dayjs = require("dayjs");
const utc = require('dayjs/plugin/utc')

const { errorHandler } = require("../common/errors.helper");
//#endregion

const router = express.Router();
dayjs.extend(utc)

/**
 * GET
 * get ping data
 */
router.get("/api/ping", (req, res, next) => {
  try {
    res.json({
      message: "Pong",
      date: dayjs().format()
    });
  } catch (error) {
    errorHandler(req, res, error);
  }
});

module.exports = router;
