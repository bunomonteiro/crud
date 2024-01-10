import 'primeflex/primeflex.min.css'
import 'primeicons/primeicons.css'
import './assets/app.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import RouterFactory from './router'

import PrimevuePlugin from './plugins/primevue'
import DayjsPlugin from './plugins/dayjs'

import vIdealColor from './directives/v-ideal-color'
import vClickOutside from './directives/v-click-outside'

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
