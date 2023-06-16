import { defineStore } from 'pinia'
import type { InitWalletConnectV2Type } from 'erdjs-vue/hooks/login/useWalletConnectV2Login';
import type {
  OnProviderLoginType
} from 'erdjs-vue/types';
import { emptyAppConfig } from 'erdjs-vue/utils/app/appConfig';

// export interface AppConfigStateType {
//   extensionLogin: OnProviderLoginType,
//   ledgerLogin: OnProviderLoginType,
//   walletConnectV2Login: InitWalletConnectV2Type,
//   webWalletLogin: OnProviderLoginType,
//   shouldUseWebViewProvider: boolean,
// }

// const initialState: AppConfigStateType = {
//   extensionLogin: undefined,
//   ledgerLogin: undefined,
//   walletConnectV2Login: undefined,
//   webWalletLogin: undefined,
//   shouldUseWebViewProvider: false,
// };

export const useAppConfigStore = defineStore('erdjs-app-config', {
  state: () => {
    return { ...emptyAppConfig }
  },
  persist: false,
  getters: {
    getExtensionLogin: (state) => {
      return state.extensionLogin;
    },
    getLedgerLogin: (state) => {
      return state.ledgerLogin;
    },
    getWalletConnectV2Login: (state) => {
      return state.walletConnectV2Login;
    },
    getWebWalletLogin: (state) => {
      return state.webWalletLogin;
    },
    getShouldUseWebViewProvider: (state) => {
      return state.shouldUseWebViewProvider;
    },
  },
  actions: {
    setExtensionLogin(payload: OnProviderLoginType) {
      this.extensionLogin = payload;
    },
    setLedgerLogin(payload: OnProviderLoginType) {
      this.ledgerLogin = payload;
    },
    setWalletConnectV2Login(payload: InitWalletConnectV2Type) {
      this.walletConnectV2Login = payload;
    },
    setWebWalletLogin(payload: OnProviderLoginType) {
      this.webWalletLogin = payload;
    },
    setShouldUseWebViewProvider(payload: boolean) {
      this.shouldUseWebViewProvider = Boolean(payload);
    },
  },
})