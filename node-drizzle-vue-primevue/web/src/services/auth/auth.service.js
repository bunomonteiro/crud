import { jwtDecode } from 'jwt-decode'
import configurations from '@/services/configurations/configuration.service'

const prefix = btoa(configurations.app.alias)

export function useAuth() {
  return {
    getUser() {
      const user = localStorage.getItem(`${prefix}.user`)
      return user ? JSON.parse(atob(user)) : null
    },
    setUser(user) {
      if(user) {
        localStorage.setItem(`${prefix}.user`, btoa(JSON.stringify(user)))
      } else {
        localStorage.removeItem(`${prefix}.user`)
      }
    },
    getToken() {
      return localStorage.getItem(`${prefix}.token`)
    },
    setToken(token) {
      if(token) {
        localStorage.setItem(`${prefix}.token`, token)
      } else {
        localStorage.removeItem(`${prefix}.token`)
      }
    },
    isLoggedIn() {
      const user = this.getUser()

      return user 
        && user?.otpEnabled 
        && user?.otpVerified
        && user?.otpValidated
    },
    signIn(token) {
      const decodedToken = jwtDecode(token)
      
      this.setToken(token)
      this.setUser(decodedToken.user)

      return decodedToken.user
    },
    signOut() {
      this.setToken(null)
      this.setUser(null)
    }
  }
}