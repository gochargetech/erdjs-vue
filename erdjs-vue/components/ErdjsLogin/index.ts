import type { App, Plugin } from 'vue'

import ErdjsLogin from './ErdjsLogin.vue'

export default {
  install(Vue: App) {
    Vue.component(ErdjsLogin.name, ErdjsLogin)
  }
} as Plugin

export {
  ErdjsLogin
}