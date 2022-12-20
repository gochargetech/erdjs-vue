import type { App, Plugin } from 'vue'

import ErdjsToasts from './component.vue'

export default {
  install(Vue: App) {
    Vue.component(ErdjsToasts.name, ErdjsToasts)
  }
} as Plugin

export {
  ErdjsToasts
}