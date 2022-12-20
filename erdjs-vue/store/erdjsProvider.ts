import { defineStore } from 'pinia'
import type { ProvidersType } from 'erdjs-vue/providers/accountProvider';
import { emptyProvider } from 'erdjs-vue/providers/utils';

interface ProviderInitialState {
  wallet_connect_uri: string,
  current: ProvidersType
}

const initialState: ProviderInitialState = {
  wallet_connect_uri: '',
  current: emptyProvider
};

export const useProviderStore = defineStore('erdjs-provider', {
  state: () => {
    return { ...initialState }
  },
  persist: true,
  getters: {
    getWalletConnectUri: (state) => {
      return state.wallet_connect_uri;
    },
    getCurrent: (state) => {
      return state.current;
    },
  },
  actions: {
    setWalletConnectUri(payload: string) {
      this.wallet_connect_uri = payload;
    },
    setCurrent(payload: ProvidersType) {
      this.current = payload;
    },
  },
})