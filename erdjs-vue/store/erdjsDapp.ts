import { defineStore } from 'pinia'
import type { NetworkType, BaseNetworkType, AccountInfoSliceNetworkType, AccountType } from 'erdjs-vue/types';
import { getRandomAddressFromNetwork } from 'erdjs-vue/utils/internal';
import { ZERO } from 'erdjs-vue/constants';

export const defaultNetwork: AccountInfoSliceNetworkType = {
  id: 'not-configured',
  chainId: '',
  name: 'NOT CONFIGURED',
  egldLabel: '',
  decimals: '18',
  digits: '4',
  gasPerDataByte: '1500',
  walletConnectDeepLink: '',
  walletConnectBridgeAddress: '',
  walletConnectV2RelayAddress: '',
  walletConnectV2ProjectId: '',
  walletConnectV2Options: {},
  walletAddress: '',
  apiAddress: '',
  explorerAddress: '',
  apiTimeout: '4000'
};

export const emptyAccount: AccountType = {
  balance: '...',
  address: '',
  nonce: 0,
  txCount: 0,
  scrCount: 0,
  claimableRewards: ZERO
};

export interface NetworkConfigStateType {
  network: AccountInfoSliceNetworkType,
  chainID: string,
  accountInfo: AccountType,
}

const initialState = {
  network: defaultNetwork,
  chainID: '1',
  accountInfo: emptyAccount
};

export const useDappStore = defineStore('erdjs-dapp', {
  state: () => {
    return { ...initialState }
  },
  persist: true,
  getters: {
    getNetworkConfig: (state) => {
      return state.network;
    },
    getChainId: (state) => {
      return state.chainID;
    },
    getAccountInfo: (state) => {
      return state.accountInfo;
    },
    getApiAddress: (state) => {
      return state.network.apiAddress;
    },
    getWalletConnectBridgeAddress: (state) => {
      return state.network.walletConnectBridgeAddress;
    },
    getWalletConnectDeepLink: (state) => {
      return state.network.walletConnectDeepLink;
    },
    getEgldLabel: (state) => {
      return state.network.egldLabel;
    },
    getWalletConnectV2RelaySelector: (state) => {
      return state.network.walletConnectV2RelayAddress;
    },
    getWalletConnectV2ProjectIdSelector: (state) => {
      return state.network.walletConnectV2ProjectId;
    },
    getWalletConnectV2OptionsSelector: (state) => {
      return state.network.walletConnectV2Options;
    },
  },
  actions: {
    updateNetworkConfig(payload: NetworkType) {
      const walletConnectBridgeAddress = getRandomAddressFromNetwork(
        payload.walletConnectBridgeAddresses
      );
      const walletConnectV2RelayAddress = getRandomAddressFromNetwork(
        payload.walletConnectV2RelayAddresses
      );

      const walletConnectV2ProjectId = payload.walletConnectV2ProjectId
        ? payload.walletConnectV2ProjectId
        : '';

      if (!walletConnectV2ProjectId) {
        throw new Error('Missing Wallet Connect V2 Project ID. You can generate one here: https://cloud.walletconnect.com/app');
      }

      const network: BaseNetworkType = payload;

      this.network = {
        ...network,
        walletConnectBridgeAddress,
        walletConnectV2ProjectId,
        walletConnectV2RelayAddress
      };
    },
    updateAccountInfo(payload: AccountType) {
      this.accountInfo = payload;
    },
    updateChainId(payload: string) {
      this.chainID = payload;
    }
  },
})