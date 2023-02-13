import type { App, Plugin } from 'vue'

import ErdjsLoginWalletConnect from './ErdjsLoginWalletConnect.vue'
import ErdjsLoginWalletConnectV2 from './ErdjsLoginWalletConnectV2.vue'

export default {
  install(Vue: App) {
    Vue.component(ErdjsLoginWalletConnect.name, ErdjsLoginWalletConnect)
    Vue.component(ErdjsLoginWalletConnectV2.name, ErdjsLoginWalletConnectV2)
  }
} as Plugin

export {
  ErdjsLoginWalletConnect,
  ErdjsLoginWalletConnectV2
}