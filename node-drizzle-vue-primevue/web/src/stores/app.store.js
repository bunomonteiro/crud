import { ref } from 'vue'
import { defineStore } from 'pinia'

import ConfigurationService from '@/services/configurations/configuration.service'
import { useAuth } from '@/services/auth/auth.service'

const auth = useAuth()

export const useAppStore = defineStore('app', () => {
  const darkTheme = ref(true)
  const breadcrumb = ref([])
  
  let themeKey = null

  // Inicializa o tema sempre que a store for instanciada
  loadTheme()

  function updateBreadcrumb(route) {
    if(route.meta?.breadcrumb) {
      breadcrumb.value = route.meta.breadcrumb
    } else {
      breadcrumb.value = []
    }
  }

  /**
   * Carrega o tema salvo no localStorage.
   * Se o usuário não estiver logado, o tema padrão é dark (true)
   * Se estiver logada, mas não encontre valor salvo, então salva o valor padrão dark (true) para o usuário logado
   */
  function loadTheme() {
    if(auth.isLoggedIn()) {
      themeKey = btoa(`${ConfigurationService.app.alias}:${auth.getUser()?.id}:theme`)
      saveTheme(localStorage.getItem(themeKey) ? /true/i.test(atob(localStorage.getItem(themeKey))) : true)
    }
  }

  function saveTheme(dark) {
    darkTheme.value = dark;
    
    if(auth.isLoggedIn()) {
      localStorage.setItem(themeKey, btoa(darkTheme.value))
    }
  }

  return { breadcrumb, updateBreadcrumb, darkTheme, loadTheme, saveTheme }
})
