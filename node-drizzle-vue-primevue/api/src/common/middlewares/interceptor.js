const configurations = require('../../services/configurations/configuration.service')

function interceptor(req, res, next) {
  if (configurations.server.isDevelopment) {
    console.log(`[REQUEST] "${req.path}"`);

    res.on("finish", function () {
      console.log(`[FINISHED]`);
    });
  }

  next();
}

module.exports = interceptor;
