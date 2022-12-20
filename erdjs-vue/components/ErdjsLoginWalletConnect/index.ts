import type { App, Plugin } from 'vue'

import ErdjsLoginWalletConnect from './ErdjsLoginWalletConnect.vue'

export default {
  install(Vue: App) {
    Vue.component(ErdjsLoginWalletConnect.name, ErdjsLoginWalletConnect)
  }
} as Plugin

export {
  ErdjsLoginWalletConnect
}