import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  const breadcrumb = ref([])
  
  function updateBreadcrumb(route) {
    if(route.meta?.breadcrumb) {
      breadcrumb.value = route.meta.breadcrumb
    } else {
      breadcrumb.value = []
    }
  }

  return { breadcrumb, updateBreadcrumb }
})
