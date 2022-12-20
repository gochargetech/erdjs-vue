import { App } from 'vue';
export interface ErdjsVue {
  getVerion(): Number;
  install(app: App): void;
}
export declare function erdjsVue(chain: string): ErdjsVue;