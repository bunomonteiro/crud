/**
 * Caso de uso: Obter URI do QrCode de autenticação em duas etapas
 */
export function GetOtpUriUseCase(api) {
  /**
   * Obtém a URI do QrCode de autenticação em duas etapas
   */
  this.handle = async function() {
    try {
      const response = await api.get('/api/v1/auth/otp/actions/get-uri')

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