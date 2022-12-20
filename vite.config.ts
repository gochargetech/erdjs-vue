import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "erdjs-vue": fileURLToPath(new URL("./erdjs-vue", import.meta.url)),
      '~bootstrap': resolve(__dirname, 'node_modules/bootstrap'),
    }
  },
  define: {
    // Fix wallet connect global not defined issue.
    global: 'globalThis',
  },
  server: {
    watch: {
      ignored: ["!erdjs-vue/components/**"],
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'erdjs-vue/main.ts'),
      name: 'ErdjsVue',
      fileName: 'erdjs-vue'
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: [
        'vue',
        'pinia',
        'pinia-plugin-persistedstate',
      ],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue',
          pinia: 'pinia',
          piniaPluginPersistedstate: 'pinia-plugin-persistedstate',
        }
      }
    }
  }
})
