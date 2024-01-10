const { eq, ilike, gte, lte, and, or, not, notIlike, desc, asc } = require("drizzle-orm")
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc')

dayjs.extend(utc);

/**
 * Obtém a condição SQL com base no filtro informado
 * @param {DataTableFilterMetaData} filter Filtro do Datatable do PrimeVue
 * @see {@link https://primevue.org/datatable/#api.datatable.interfaces.DataTableFilterMetaData}
 * @see {@link https://orm.drizzle.team/docs/select#filtering}
 * @see {@link https://orm.drizzle.team/docs/operators}
 * @returns Condição SQL como operação Drizzle
 */
function getCondition(filter) {
  if(filter?.matchMode === "equals") {
    return eq(filter.column, filter.value)
  }

  if(filter?.matchMode === "notEquals") {
    return not(eq(filter.column, filter.value))
  }

  if(filter?.matchMode === "contains") {
    return ilike(filter.column, `%${filter.value}%`)
  }

  if(filter?.matchMode === "notContains") {
    return notIlike(filter.column, `%${filter.value}%`)
  }

  if(filter?.matchMode === "startsWith") {
    return ilike(filter.column, `${filter.value}%`)
  }

  if(filter?.matchMode === "endsWith") {
    return ilike(filter.column, `%${filter.value}`)
  }

  // Date
  if(filter?.matchMode === "dateIs") {
    // Pesquisa por: dia/mes/ano hora:minuto
    // Não considera os segundos nem os milissegundos
    return and(
      gte(filter.column, dayjs.utc(filter.value).second(0).millisecond(0)),
      lte(filter.column, dayjs.utc(filter.value).second(59).millisecond(999))
    )
  }

  if(filter?.matchMode === "dateIsNot") {
    // Pesquisa por: dia/mes/ano hora:minuto
    // Não considera os segundos nem os milissegundos
    return or(
      lte(filter.column, dayjs.utc(filter.value).second(0).millisecond(0)),
      gte(filter.column, dayjs.utc(filter.value).second(59).millisecond(999))
    )
  }

  if(filter?.matchMode === "dateAfter") {
    return gte(filter.column, dayjs.utc(filter.value).second(0).millisecond(0))
  }

  if(filter?.matchMode === "dateBefore") {
    return lte(filter.column, dayjs.utc(filter.value).second(59).millisecond(999))
  }

  return null
}

/**
 * Verifica se o filtro é do tipo Menu
 * @param {DataTableFilterMeta} filter Filtro do PrimeVue
 * @see {@link https://primevue.org/datatable/#api.datatable.interfaces.DataTableFilterMeta}
 */
function isMenuFilter(filter) {
  // return Object.keys(filters).some((key) => Object.keys(filters[key]).includes('operator'))
  return Object.keys(filter).includes('constraints')
}

/**
 * Verifica se os filtros são do tipo Row
 * @param {DataTableFilterMeta} filters Filtros do PrimeVue
 * @see {@link https://primevue.org/datatable/#api.datatable.interfaces.DataTableFilterMeta}
 */
function isRowFilter(filters) {
  return !isMenuFilter(filters)
}

/**
 * Transforma os filtros do tipo Row (DataTableFilterMetaData) do PrimeVue em cláusula Where do Drizzle
 * @param {DataTableFilterMeta} filter Filtros do PrimeVue
 * @param {any} filter.value Valor do filtro
 * @param {undefined | string} filter.matchMode Operação do filtro
 * @see {@link https://primevue.org/datatable/#api.datatable.interfaces.DataTableFilterMeta}
 * @see {@link https://primevue.org/datatable/#api.datatable.interfaces.DataTableFilterMetaData}
 * @see {@link https://orm.drizzle.team/docs/select#filtering}
 * @returns Cláusula Where do Drizzle
 */
function menufiltersToWhere(filter) {
  if(!filter) {
    return null
  }

  const conditions = filter.constraints
    .filter(constraint => constraint?.value)
    .map(filter => getCondition(filter))
    .filter(condition => condition !== null)
  
  if(!conditions?.length) {
    return null
  }

  if(filter.operator === "and") {
    return and(...conditions)
  } else {
    return or(...conditions)
  }
}


/**
 * Transforma os filtros do tipo Row (DataTableFilterMetaData) do PrimeVue em cláusula Where do Drizzle
 * @param {DataTableFilterMeta} filter Filtros do PrimeVue
 * @param {any} filter.value Valor do filtro
 * @param {undefined | string} filter.matchMode Operação do filtro
 * @see {@link https://primevue.org/datatable/#api.datatable.interfaces.DataTableFilterMeta}
 * @see {@link https://primevue.org/datatable/#api.datatable.interfaces.DataTableFilterMetaData}
 * @see {@link https://orm.drizzle.team/docs/select#filtering}
 * @returns Cláusula Where do Drizzle
 */
function rowfiltersToWhere(filter) {
  if(!filter) {
    return null
  }

  return filter.value ? getCondition(filter) : null
}

/**
 * Adiciona aos filtros as referidas colunas
 * @param {DataTableFilterMeta} filters Filtros do PrimeVue
 * @param {attachColumnsCallback} callback 
 * @see {@link https://primevue.org/datatable/#api.datatable.interfaces.DataTableFilterMeta}
 * @callback attachColumnsCallback
 * @param {string} target Nome do filtro (propriedade) alvo
 * @param {object} filter Filtro
 */
function attachColumns(filters, callback) {
  if(!filters) {
    return null
  }

  Object.keys(filters)
    .forEach(target => {
      if(isRowFilter(filters[target])) {
        callback(target, filters[target])
      } else {
        filters[target].constraints.forEach(filter => callback(target, filter))
      }
    })

  return filters;
}

/**
 * Transforma os filtros do Datatable do PrimeVue em cláusula Where do Drizzle
 * @param {DataTableFilterMeta} filters Filtros do PrimeVue
 * @param {filtersToWhereCallback} callback Função que adiciona aos filtros as referidas colunas
 * @see {@link https://primevue.org/datatable/#api.datatable.interfaces.DataTableFilterMeta}
 * @callback filtersToWhereCallback
 * @param {string} target Nome do filtro (propriedade) alvo
 * @param {object} filter Filtro
 * @returns Cláusula Where do Drizzle
 */
function filtersToWhere(filters, callback) {
  filters = attachColumns(filters, callback)

  if(!filters) {
    return null
  }

  const where = Object.keys(filters).map(target => {
    return isMenuFilter(filters[target]) ? menufiltersToWhere(filters[target]) : rowfiltersToWhere(filters[target])
  }).filter(filter => filter != null)

  if(where.length == 1) {
    return where[0]
  }

  return and(...where)
}

/**
 * Transforma a ordenação do Datatable do PrimeVue em cláusula Order By do Drizzle
 * @param {DataTableSortMeta[]} sorting Ordenação do PrimeVue
 * @param {sortingToOrderByCallback} callback Função que retorna a coluna da propriedade alvo
 * @see DataTableSortMeta {@link https://primevue.org/datatable/#api.datatable.interfaces.DataTableSortMeta}
 * @callback sortingToOrderByCallback
 * @param {string} target Nome da propriedade alvo
 */
function sortingToOrderBy(sorting, callback) {
  return sorting.filter(item => item.order == -1 || item.order == 1)
    .map(item => {
      return item.order == -1 ? desc(callback(item.field)) : asc(callback(item.field))
    })
}

module.exports = {
  filtersToWhere,
  sortingToOrderBy
}