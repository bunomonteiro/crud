const Joi = require('joi')

/**
 * Schema de JsonPatch
 */
const jsonPatchSchema = Joi.array().items(
  Joi.object({
    op: Joi.string().valid('add', 'remove', 'replace', 'move', 'copy', 'test').required(),
    path: Joi.string().required(),
    from: Joi.string(), // Apenas para operações move e copy
    value: Joi.any(),    // Apenas para operações add e replace
  })
)

module.exports = jsonPatchSchema