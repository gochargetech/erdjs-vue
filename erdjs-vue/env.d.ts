/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_VUE_APP_WC_PROJECT_ID: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
