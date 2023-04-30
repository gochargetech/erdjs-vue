import type { App, Plugin } from 'vue'

import ErdjsLoginLedger from './ErdjsLoginLedger.vue'

export default {
  install(Vue: App) {
    Vue.component(ErdjsLoginLedger.name, ErdjsLoginLedger)
  }
} as Plugin

export {
  ErdjsLoginLedger
}