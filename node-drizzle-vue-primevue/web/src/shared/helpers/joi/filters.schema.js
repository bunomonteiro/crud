import Joi from 'joi'

/**
 * Schema de filtro do Datatable do PrimeVue
 * @see {@link https://primevue.org/datatable}
 */
export const filtersSchema = Joi.object({
  // Row mode
  value: Joi.any().optional(),
  matchMode: Joi.string().optional(),
  // Menu mode
  operator: Joi.string().optional(),
  constraints: Joi.array().items(Joi.object({
    value: Joi.any().optional(),
    matchMode: Joi.string().required()
  })).optional()
})
