import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Import erdjs vue.
import { erdjsVue } from './../dist/erdjs-vue';
import './../dist/style.css';

import './assets/main.scss'

const app = createApp(App)
app.use(router);

// erdjs
const erdjs = erdjsVue({
  loadCss: false,
  chain: 'devnet'
});
app.use(erdjs)

app.mount('#app')