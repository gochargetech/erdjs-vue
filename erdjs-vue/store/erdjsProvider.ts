import { defineStore } from 'pinia'
import type { ProvidersType } from 'erdjs-vue/providers/accountProvider';
import { emptyProvider } from 'erdjs-vue/providers/utils';

interface ProviderInitialState {
  getWalletConnectUri: string,
  getCurrent: ProvidersType
}

const initialState: ProviderInitialState = {
  getWalletConnectUri: '',
  getCurrent: emptyProvider
};

export const useNetworkProviderStore = defineStore('erdjs-provider', {
  state: () => {
    return { ...initialState }
  },
  persist: true,
  actions: {
    setWalletConnectUri(payload: string) {
      this.getWalletConnectUri = payload;
    },
    setCurrent(payload: ProvidersType) {
      this.getCurrent = payload;
    },
  },
})