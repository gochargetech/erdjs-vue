import type { App, Plugin } from 'vue'

import ErdjsToast from './component.vue'

export default {
  install(Vue: App) {
    Vue.component(ErdjsToast.name, ErdjsToast)
  }
} as Plugin

export {
  ErdjsToast
}