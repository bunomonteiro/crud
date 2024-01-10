import axios from 'axios'

import configurations from '@/services/configurations/configuration.service'
import { useAuth } from '@/services/auth/auth.service'

const auth = useAuth()

export function useHttp() {
  const instance = axios.create()
  return instance
}

export function useApi() {
  const token = auth.getToken()
  const instance = axios.create({
    baseURL: configurations.api.uri,
    timeout: 0,
    headers: {'authorization': `bearer ${token}`}
  })

  return instance
}