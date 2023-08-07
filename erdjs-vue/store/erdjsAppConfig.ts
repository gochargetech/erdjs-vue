import { defineStore } from 'pinia'
import type { InitWalletConnectV2Type } from 'erdjs-vue/hooks/login/useWalletConnectV2Login';
import type {
  OnProviderLoginType
} from 'erdjs-vue/types';
import { emptyAppConfig } from 'erdjs-vue/utils/app/appConfig';

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
    getWithGuardianInfo: (state) => {
      return state.withGuardianInfo;
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
    setWithGuardianInfo(payload: boolean) {
      this.withGuardianInfo = Boolean(payload);
    },
  },
})