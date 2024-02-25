function interceptor(req, res, next) {
  if (global.configurations.server.isDevelopment) {
    console.log(`\n\n[REQUEST] "${req.path}"`)

    res.on("finish", function () {
      console.log(`[FINISHED]`)
    })
  }

  next()
}

module.exports = interceptor;
