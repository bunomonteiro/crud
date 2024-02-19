import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from '@/presentation/App.vue'
import RouterFactory from '@/adapters/router'

import PrimevuePlugin from '@/adapters/plugins/primevue'
import DayjsPlugin from '@/adapters/plugins/dayjs'

import vIdealColor from '@/adapters/directives/v-ideal-color'
import vClickOutside from '@/adapters/directives/v-click-outside'

import '@/presentation/assets/app.css'

const app = createApp(App)
const pinia = createPinia()
const router = RouterFactory(pinia)

app.use(pinia)
app.use(router)
app.use(PrimevuePlugin)
app.use(DayjsPlugin)

app.directive('ideal-color', vIdealColor)
app.directive('click-outside', vClickOutside)

app.mount('#app')
