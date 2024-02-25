const Joi = require('joi')

/**
 * Schema da ordenação do Datatable do PrimeVue
 * @see {@link https://primevue.org/datatable/}
 */
const sortingSchema = Joi.array().items(Joi.object({
  field: Joi.string().required(),
  order: Joi.number().allow(-1, 0, 1).optional()
}))

module.exports = sortingSchema