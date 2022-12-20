import type { App, Plugin } from 'vue'

import ErdjsLoginWebWallet from './ErdjsLoginWebWallet.vue'

export default {
  install(Vue: App) {
    Vue.component(ErdjsLoginWebWallet.name, ErdjsLoginWebWallet)
  }
} as Plugin

export {
  ErdjsLoginWebWallet
}