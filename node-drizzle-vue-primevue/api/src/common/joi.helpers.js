const Joi = require('joi');

/**
 * Tradução das mensagens de validação do Joi
 */
const joiMessages = {
  // Alternatives
  'alternatives.all': '{{#label}} não é compatível com nenhum dos tipos pedidos',
  'alternatives.any': '{{#label}} não é compatível com nenhum dos tipos permitidos',
  'alternatives.match': '{{#label}} não é compatível com nenhum dos tipos permitidos',
  'alternatives.one': '{{#label}} é compatível com mais de um dos tipos permitidos',
  'alternatives.types': '{{#label}} deve ser um dos {{#types}}',
  // Any
  'any.custom': '{{#label}} falhou na validação devido a {{#error.message}}',
  'any.default': '{{#label}} gerou um erro ao executar o método default',
  'any.failover': '{{#label}} gerou um erro ao executar o método failover',
  'any.invalid': '{{#label}} contém um valor inválido',
  'any.only': '{{#label}} deve ser {if(#valids.length == 1, "", "um dos ")}{{#valids}}',
  'any.ref': '{{#label}} {{#arg}} referência {{:#ref}} que {{#reason}}',
  'any.required': '{{#label}} é obrigatório',
  'any.unknown': '{{#label}} não é permitido',
  // Array
  'array.base': '{{#label}} deve ser um array',
  'array.excludes': '{{#label}} contém um valor excluído',
  'array.hasKnown': '{{#label}} não contem nenhum padrão necessário para o tipo {:#patternLabel}',
  'array.hasUnknown': '{{#label}} não contem nenhum padrão necessário',
  'array.includes': '{{#label}} não é compatível com nenhum dos tipos permitidos',
  'array.includesRequiredBoth': '{{#label}} não contém {{#knownMisses}} e outro(s) valor(es) {{#unknownMisses}} obrigatórios',
  'array.includesRequiredKnowns': '{{#label}} não contém {{#knownMisses}}',
  'array.includesRequiredUnknowns': '{{#label}} não contém o(s) valor(es) {{#unknownMisses}} obrigatórios',
  'array.length': '{{#label}} deve conter {{#limit}} itens',
  'array.max': '{{#label}} deve conter no máximo {{#limit}} itens',
  'array.min': '{{#label}} deve conter pelo menos {{#limit}} itens',
  'array.orderedLength': '{{#label}} deve conter pelo menos {{#limit}} itens',
  'array.sort': '{{#label}} deve ser ordenado em {#order} por {{#by}}',
  'array.sort.mismatching': '{{#label}} não pode ser ordenado devido a tipos incompatíveis',
  'array.sort.unsupported': '{{#label}} não pode ser ordenado devido ao tipo não suportado: {#type}',
  'array.sparse': '{{#label}} não deve ser um item não definido',
  'array.unique': '{{#label}} contém um item duplicado',
  // Binary
  'binary.base': '{{#label}} deve ser um buffer ou um texto',
  'binary.length': '{{#label}} deve ter {{#limit}} bytes',
  'binary.max': '{{#label}} deve ter no máximo {{#limit}} bytes',
  'binary.min': '{{#label}} deve ter pelo menos {{#limit}} bytes',
  // Boolean
  'boolean.base': '{{#label}} deve ser um booleano',
  // Date
  'date.base': '{{#label}} deve ser uma data válida.',
  'date.format': '{{#label}} deve estar no formato: {msg("date.format." + #format) || #format}',
  'date.greater': '{{#label}} deve ser maior que {{:#limit}}',
  'date.less': '{{#label}} deve ser menor que {{:#limit}}',
  'date.max': '{{#label}} deve ser menor que ou igual a {{:#limit}}',
  'date.min': '{{#label}} deve ser maior que ou igual a {{:#limit}}',
  // Messages used in date.format
  'date.format.iso': 'data ISO 8601',
  'date.format.javascript': 'timestamp ou número de milisegundos',
  'date.format.unix': 'timestamp ou número de segundos',
  // Functions
  'function.arity': '{{#label}} deve ter {{#n}} argumentos',
  'function.class': '{{#label}} deve ser uma classe',
  'function.maxArity': '{{#label}} deve ter no máximo {{#n}} argumentos',
  'function.minArity': '{{#label}} deve ter pelo menos {{#n}} argumentos',
  // Object
  'object.and': '{{#label}} contém {{#presentWithLabels}} sem seus pares necessários {{#missingWithLabels}}',
  'object.assert': '{{#label}} não é válido devido a {if(#subject.key, `"` + #subject.key + `" falhou em ` + (#message || "passar no teste de validação"), #message || "a validação falhou")}',
  'object.base': '{{#label}} deve ser do tipo {{#type}}',
  'object.instance': '{{#label}} deve ser uma instância de {{:#type}}',
  'object.length': '{{#label}} deve ter {{#limit}} entrada{if(#limit == 1, "", "s")}',
  'object.max': '{{#label}} deve ter no máximo {{#limit}} entrada{if(#limit == 1, "", "s")}',
  'object.min': '{{#label}} deve ter pelo menos {{#limit}} entrada{if(#limit == 1, "", "s")}',
  'object.missing': '{{#label}} deve conter pelo menos um de {{#peersWithLabels}}',
  'object.nand': '{{:#mainWithLabel}} não deve existir simultaneamente com {{#peersWithLabels}}',
  'object.oxor': '{{#label}} contem um conflito entre pares opcionais exlusivos {{#peersWithLabels}}',
  'object.pattern.match': '{{#label}} entradas falharam em se adequar aos padrões pedidos',
  'object.refType': '{{#label}} deve ser uma referência do Joi',
  'object.regex': '{{#label}} deve ser um objeto RegExp',
  'object.rename.multiple': '{{#label}} não pode renomear {{:#from}} pois renomear multiplas entradas esta desabilitado e outra chave já foi renomeada para {{:#to}}',
  'object.rename.override': '{{#label}} não pode renomear {{:#from}} pois sobrescrever está desabilitado e o destino {{:#to}} existe',
  'object.schema': '{{#label}} deve ser um schema Joi do tipo {{#type}}',
  'object.unknown': '{{#label}} não é permitido',
  'object.with': '{{:#mainWithLabel}} falta par obrigatório {{:#peerWithLabel}}',
  'object.without': '{{:#mainWithLabel}} conflita com par proibido {{:#peerWithLabel}}',
  'object.xor': '{{#label}} contém um conflito entre pares exclusivos {{#peersWithLabels}}',
  // Number
  'number.base': '{{#label}} deve ser um número',
  'number.greater': '{{#label}} deve ser maior que {{#limit}}',
  'number.infinity': '{{#label}} não pode ser infinito',
  'number.integer': '{{#label}} deve ser um número inteiro',
  'number.less': '{{#label}} deve ser menor que {{#limit}}',
  'number.max': '{{#label}} deve ser menor que ou igual a {{#limit}}',
  'number.min': '{{#label}} deve ser maior que ou igual a {{#limit}}',
  'number.multiple': '{{#label}} deve ser um múltiplo de {{#multiple}}',
  'number.negative': '{{#label}} deve ser um número negativo',
  'number.port': '{{#label}} deve ser uma porta válida',
  'number.positive': '{{#label}} deve ser um número positivo',
  'number.precision': '{{#label}} não deve ter mais que {{#limit}} casas decimais',
  'number.unsafe': '{{#label}} deve ser um número seguro',
  // String
  'string.alphanum': '{{#label}} deve conter apenas números e letras',
  'string.base': '{{#label}} deve ser um texto',
  'string.base64': '{{#label}} deve ser um texto base64 válido',
  'string.creditCard': '{{#label}} deve ser um número de cartão de crédito válido',
  'string.dataUri': '{{#label}} deve ser uma URI de dados',
  'string.domain': '{{#label}} deve ser um nome de domínio válido',
  'string.email': '{{#label}} deve ser um e-mail válido',
  'string.empty': '{{#label}} não deve ser vazio',
  'string.guid': '{{#label}} deve ser um GUID válido',
  'string.hex': '{{#label}} deve conter apenas caracteres hexadecimais',
  'string.hexAlign': '{{#label}} a decodificação hexadecimal deve ser byte alinhada',
  'string.hostname': '{{#label}} deve ser um nome de host válido',
  'string.ip': '{{#label}} deve ser um endereço de ip válido com um CIDR {{#cidr}}',
  'string.ipVersion': '{{#label}} deve ser um endereço de ip válido de uma das versões: {{#version}} com um CIDR {{#cidr}}',
  'string.isoDate': '{{#label}} deve estar no formato ISO',
  'string.isoDuration': '{{#label}} deve ser uma duração com formato ISO 8601 válido',
  'string.length': 'A quantidade de caracteres de {{#label}} deve ser de {{#limit}} caracteres',
  'string.lowercase': '{{#label}} deve conter apenas caracteres minúsculos',
  'string.max': 'A quantidade de caracteres de {{#label}} deve ser menor ou igual que {{#limit}}',
  'string.min': 'A quantidade de caracteres de {{#label}} deve ser de pelo menos {{#limit}}',
  'string.normalize': '{{#label}} deve ser normalizado unicode no formulário {{#form}}',
  'string.token': '{{#label}} deve conter apenas números, letras e caracteres de sublinhado',
  'string.pattern.base': '{{#label}} não confere com o padrão requerido: {{#regex}}',
  'string.pattern.name': '{{#label}} não confere com o padrão "{{#name}}"',
  'string.pattern.invert.base': '{{#label}} confere com o padrão invertido: {{#regex}}',
  'string.pattern.invert.name': '{{#label}} confere com o padrão invertido "{{#name}}"',
  'string.trim': '{{#label}} não deve espaços em branco no começo ou no final',
  'string.uri': '{{#label}} deve ser uma URL válida',
  'string.uriCustomScheme': '{{#label}} deve ser uma url válida de acordo com o padrão {{#scheme}}',
  'string.uriRelativeOnly': '{{#label}} deve ser uma url relativa válida',
  'string.uppercase': '{{#label}} deve conter apenas caracteres maiúsculos',
  // Symbol
  'symbol.base': '{{#label}} deve ser um símbolo',
  'symbol.map': '{{#label}} deve ser um dos {{#map}}',
};

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
);

/**
 * Schema de filtro do Datatable do PrimeVue
 * @see {@link https://primevue.org/datatable/}
 */
const filtersSchema = Joi.object({
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

/**
 * Schema da ordenação do Datatable do PrimeVue
 * @see {@link https://primevue.org/datatable/}
 */
const sortingSchema = Joi.array().items(Joi.object({
  field: Joi.string().required(),
  order: Joi.number().allow(-1, 0, 1).optional()
}))

module.exports = {
  joiMessages,
  jsonPatchSchema,
  // PrimeVue
  filtersSchema,
  sortingSchema
};