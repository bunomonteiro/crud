/**
 * Caso de uso: Iniciar processo de ativação da autenticação em duas etapas
 */
export function StartOtpRegistrationUseCase(api) {
  /**
   * Inicia processo de ativação da autenticação em duas etapas
   */
  this.handle = async function() {
    try {
      const response = await api.post('/api/v1/auth/otp/actions/start-registration')

      if (response?.error) {
        return {
          error: true,
          message: response.message
        }
      }

      return {
        data: response?.data?.tokenUri
      }
    } catch (error) {
      return {
        error: error,
        message: 'Atualize a página para tentar novamente'
      }
    }
  }
}