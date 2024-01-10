import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  const darkTheme = ref(true)
  const breadcrumb = ref([])

  function updateBreadcrumb(route) {
    if(route.meta?.breadcrumb) {
      breadcrumb.value = route.meta.breadcrumb
    } else {
      breadcrumb.value = []
    }
  }

  function toggleTheme() {
    darkTheme.value = !darkTheme.value;
  }

  return { breadcrumb, updateBreadcrumb, darkTheme, toggleTheme }
})
