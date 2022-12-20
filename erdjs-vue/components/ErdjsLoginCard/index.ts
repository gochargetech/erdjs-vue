import type { App, Plugin } from 'vue'

import ErdjsLoginCard from './component.vue'

export default {
  install(Vue: App) {
    Vue.component(ErdjsLoginCard.name, ErdjsLoginCard)
  }
} as Plugin

export {
  ErdjsLoginCard
}