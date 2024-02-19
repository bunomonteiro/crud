import { Patch } from '@/domain/value_objects/patch';
import Joi, { messages as joiMessages, jsonPatchSchema } from '@/shared/helpers/joi'

/**
 * Caso de uso: Atualizar usuário
*/
export function UpdateUserUseCase(api) {
  /**
   * Validação requisição
   * @param {UpdateUserPayload} payload Parâmetros da requisição
   */
  function validate(payload) {
    const schema = Joi.object({
      username: Joi.string().required().label('Login'),
      patches: jsonPatchSchema.required().label("Atualizações"),
    }).required().label('Atualização').messages(joiMessages)

    return schema.validate(payload);
  }

  /**
   * Atualiza usuário
   * @param {UpdateUserPayload} payload Parâmetros da requisição
   */
  this.handle = async function(payload = new UpdateUserPayload()) {
    const { error } = validate(payload);
    
    if (error) {
      return {
        error: true,
        message: error.message
      };
    }

    try {
      const response = await api.patch(`/api/v1/users/${encodeURI(payload.username)}`, {
        patches: payload.patches
      })

      if (response?.error) {
        return {
          error: true,
          message: response.message
        }
      }

      return {
        data: response?.data?.user,
      }
    } catch (error) {
      return {
        error: error,
        message: 'Não foi possível atualizar o usuário'
      };
    }
  }
}

/**
 * Parâmetros da requisição
 * @param {Object} options Payload da requisição
 * @param {string} options.username Login do usuário alvo
 * @param {Patch[]} options.patches Atualizações
 */
export function UpdateUserPayload(options = {}) {
  this.username = options.username
  this.patches = options.patches ?? []
}