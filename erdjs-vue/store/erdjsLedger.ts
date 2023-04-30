import { defineStore } from 'pinia'
import type { SelectedAddress } from 'erdjs-vue/hooks/login/useAddressScreens';

interface LedgerInitialState {
  version: string,
  contractDataEnabled: boolean,
  errorMessage: string,
  isLoading: boolean,
  isLoadingAccounts: boolean,
  selectedAddress: SelectedAddress | null,
  showAddressList: boolean,
  startIndex: number,
  accounts: string[]
}

const initialState: LedgerInitialState = {
  version: '',
  contractDataEnabled: false,
  errorMessage: '',
  isLoading: false,
  isLoadingAccounts: false,
  selectedAddress: null,
  showAddressList: false,
  startIndex: 0,
  accounts: [],
};

export const useLedgerStore = defineStore('erdjs-ledger', {
  state: () => {
    return { ...initialState }
  },
  persist: false,
  getters: {
    getVersion: (state) => {
      return state.version;
    },
    getContractDataEnabled: (state) => {
      return state.contractDataEnabled;
    },
    getErrorMessage: (state) => {
      return state.errorMessage;
    },
    getIsLoading: (state) => {
      return state.isLoading;
    },
    getIsLoadingAccounts: (state) => {
      return state.isLoadingAccounts;
    },
    getSelectedAddress: (state) => {
      return state.selectedAddress;
    },
    getShowAddressList: (state) => {
      return state.showAddressList;
    },
    getStartIndex: (state) => {
      return state.startIndex;
    },
    getAccounts: (state) => {
      return state.accounts;
    },
  },
  actions: {
    logout() {
      this.$reset();
    },
    resetAccounts() {
      this.accounts = [];
      this.isLoading = false;
      this.isLoadingAccounts = false;
      this.showAddressList = false;
      this.selectedAddress = null;
      this.startIndex = 0;
    },
    setVersion(payload: string) {
      this.version = payload;
    },
    setContractDataEnabled(payload: boolean) {
      this.contractDataEnabled = payload;
    },
    setError(payload: string) {
      this.errorMessage = payload;
    },
    setIsLoading(payload: boolean) {
      this.isLoading = payload;
    },
    setIsLoadingAccounts(payload: boolean) {
      this.isLoadingAccounts = payload;
    },
    setSelectedAddress(payload: SelectedAddress | null) {
      this.selectedAddress = payload;
    },
    setShowAddressList(payload: boolean) {
      this.showAddressList = payload;
    },
    setStartIndex(payload: number) {
      this.startIndex = payload;
    },
    setAccounts(payload: string[]) {
      this.accounts = payload;
    },
    changePage(payload: string) {
      if (payload === 'next') {
        this.startIndex++;
      }
      if (payload === 'prev') {
        this.startIndex = this.startIndex === 0 ? this.startIndex : this.startIndex--;
      }
    }
  },
})