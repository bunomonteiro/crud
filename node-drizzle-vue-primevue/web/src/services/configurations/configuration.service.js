const ConfigurationService = {
  app: {
    uri: import.meta.env.BASE_URL,
    name: import.meta.env.VITE_APP_NAME,
    alias: import.meta.env.VITE_APP_ALIAS,
    version: import.meta.env.VITE_APP_VERSION ?? '0.0.0'
  },
  api: {
    uri: import.meta.env.VITE_API_URI
  }
}

export default ConfigurationService