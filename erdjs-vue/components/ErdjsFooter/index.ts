import type { App, Plugin } from 'vue'

import ErdjsFooter from './component.vue'

export default {
  install(Vue: App) {
    Vue.component(ErdjsFooter.name, ErdjsFooter)
  }
} as Plugin

export {
  ErdjsFooter
}