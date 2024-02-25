const Joi = require('joi')

const joiMessages = require('./joi_messages')
const jsonPatchSchema = require('./json_patch.schema')
const filtersSchema = require('./primevue/filters.schema')
const sortingSchema = require('./primevue/sorting.schema')

module.exports = {
  joiMessages,
  jsonPatchSchema,
  // Primevue
  filtersSchema,
  sortingSchema
};