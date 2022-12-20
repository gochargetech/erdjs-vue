import { defineStore } from 'pinia'
import { LoginMethodsEnum, type TokenLoginType } from 'erdjs-vue/types';
import { useAccountStore } from './erdjsAccountInfo'

export interface WalletConnectLoginType {
  loginType: string;
  callbackRoute: string;
  logoutRoute: string;
}

export interface LedgerLoginType {
  index: number;
  loginType: string;
}

export interface LoginInfoType {
  data: any;
  expires: number;
}

export interface LoginInfoStateType {
  loginMethod: LoginMethodsEnum;
  walletConnectLogin: WalletConnectLoginType | null;
  ledgerLogin: LedgerLoginType | null;
  tokenLogin: TokenLoginType | null;
  walletLogin: LoginInfoType | null;
  extensionLogin: LoginInfoType | null;
  isLoginSessionInvalid: boolean;
}

const initialState: LoginInfoStateType = {
  loginMethod: LoginMethodsEnum.none,
  walletConnectLogin: null,
  ledgerLogin: null,
  tokenLogin: null,
  walletLogin: null,
  extensionLogin: null,
  isLoginSessionInvalid: false
};

export const useLoginInfoStore = defineStore('erdjs-login-info', {
  state: () => {
    return { ...initialState }
  },
  persist: true,
  getters: {
    getLoginMethod: (state) => {
      return state.loginMethod;
    },
    getTokenLogin: (state) => {
      return state.tokenLogin;
    },
    getTokenLoginSignature: (state) => {
      return state.tokenLogin?.signature;
    },
    getWalletLogin: (state) => {
      return state.walletLogin;
    },
    getWalletConnectLogin: (state) => {
      return state.walletConnectLogin;
    },
    getLedgerLogin: (state) => {
      return state.ledgerLogin;
    },
    isLoggedIn: (state) => {
      return state.loginMethod != LoginMethodsEnum.none && Boolean(useAccountStore().getAddress)
    }
  },
  actions: {
    setLoginMethod(payload: LoginMethodsEnum) {
      this.loginMethod = payload;
    },
    setTokenLogin(payload: TokenLoginType) {
      this.tokenLogin = payload;
    },
    setTokenLoginSignature(payload: string) {
      if (this.tokenLogin != null) {
        this.tokenLogin.signature = payload;
      }
    },
    setWalletLogin(payload: LoginInfoType | null) {
      this.loginMethod = LoginMethodsEnum.wallet;
      this.walletLogin = payload;
    },
    setWalletConnectLogin(payload: WalletConnectLoginType) {
      this.loginMethod = LoginMethodsEnum.walletconnect;
      this.walletConnectLogin = payload;
    },
    setLedgerLogin(payload: LedgerLoginType) {
      this.loginMethod = LoginMethodsEnum.ledger;
      this.ledgerLogin = payload;
    },
    logout() {
      this.$reset();
    }
  },
})