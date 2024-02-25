const fs = require("fs")
const Handlebars = require("handlebars")

/**
 * Serviço de template
 */
const TemplateCompiler = {
  /**
   * Cria uma nova string baseada num template
   * @param {string} source Modelo
   * @param {object} data Dados a serem vinculados ao modelo
   * @returns 
   */
  compileFromText(source = "", data = {}) {
    const template = Handlebars.compile(source)
    return template(data)
  },

  /**
   * Cria uma nova string baseada num arquivo template
   * @param {string} sourcePath Caminho do arquivo modelo
   * @param {object} data Dados a serem vinculados ao modelo
   * @returns 
   */
  compileFromPath(sourcePath, data = {}) {
    const source = fs.readFileSync(sourcePath, 'utf8')
    const template = Handlebars.compile(source)
    return template(data)
  }
}

module.exports = TemplateCompiler;