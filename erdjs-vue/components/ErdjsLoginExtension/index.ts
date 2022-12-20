import type { App, Plugin } from 'vue'

import ErdjsLoginExtension from './ErdjsLoginExtension.vue'

export default {
  install(Vue: App) {
    Vue.component(ErdjsLoginExtension.name, ErdjsLoginExtension)
  }
} as Plugin

export {
  ErdjsLoginExtension
}