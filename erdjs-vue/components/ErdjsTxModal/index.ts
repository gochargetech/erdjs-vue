import type { App, Plugin } from 'vue'

import ErdjsTxModal from './component.vue'

export default {
  install(Vue: App) {
    Vue.component(ErdjsTxModal.name, ErdjsTxModal)
  }
} as Plugin

export {
  ErdjsTxModal
}