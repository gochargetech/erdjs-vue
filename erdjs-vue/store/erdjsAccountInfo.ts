import { Address } from '@elrondnetwork/erdjs';
import { defineStore } from 'pinia'
import type { AccountType, LoginActionPayloadType } from 'erdjs-vue/types';
import { ZERO } from 'erdjs-vue/constants';


export interface LedgerAccountType {
  index: number;
  address: string;
  hasContractDataEnabled: boolean;
  version: string;
}

export interface UpdateLedgerAccountPayloadType {
  index: number;
  address: string;
}

export interface AccountInfoSliceType {
  address: string;
  shard?: number;
  accounts: { [address: string]: AccountType };
  publicKey: string;
  ledgerAccount: LedgerAccountType | null;
  walletConnectAccount: string | null;
  isAccountLoading: boolean;
  websocketEvent: {
    timestamp: number;
    message: string;
  } | null;
  accountLoadingError: string | null;
}

export const emptyAccount: AccountType = {
  balance: '...',
  address: '',
  nonce: 0,
  txCount: 0,
  scrCount: 0,
  claimableRewards: ZERO
};

const initialState: AccountInfoSliceType = {
  address: '',
  websocketEvent: null,
  accounts: { '': emptyAccount },
  ledgerAccount: null,
  publicKey: '',
  walletConnectAccount: null,
  isAccountLoading: true,
  accountLoadingError: null
};


export const useAccountStore = defineStore('erdjs-account', {
  state: () => {
    return { ...initialState }
  },
  persist: true,
  getters: {
    getAddress: (state) => {
      return state.address;
    },
    getAccountNonce: (state) => {
      return state.accounts[state.address] ? state.accounts[state.address].nonce : 0;
    },
    getAccountBalance: (state) => {
      return state.accounts[state.address] ? state.accounts[state.address].balance : '...';
    },
    getAccount: (state) => {
      return state.accounts[state.address] ? state.accounts[state.address] : emptyAccount;
    },
    getWebsocketEvent: (state) => {
      return state.websocketEvent;
    },
  },
  actions: {
    setLogin(payload: LoginActionPayloadType) {
      const { address } = payload;
      this.address = address;
      this.publicKey = new Address(address).hex();
    },
    setAddress(payload: string) {
      const address = payload;
      this.address = address;
      this.publicKey = new Address(address).hex();
    },
    setAccount(payload: AccountType) {
      // account fetching always comes after address is populated
      const isSameAddress = this.address === payload.address;
      this.accounts = {
        [this.address]: isSameAddress ? payload : emptyAccount
      };
      this.isAccountLoading = false;
      this.accountLoadingError = null;
    },
    setAccountNonce(payload: number) {
      this.accounts[this.address].nonce = payload;
    },
    setAccountShard(payload: number) {
      this.shard = payload;
    },
    setWebsocketEvent(payload: string) {
      this.websocketEvent = {
        timestamp: Date.now(),
        message: payload
      };
    },
    logout() {
      this.$reset();
    }
  },
})