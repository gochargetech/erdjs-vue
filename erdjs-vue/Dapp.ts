import type {
  EnvironmentsEnum,
  NetworkType
} from './types';
import { fallbackNetworkConfigurations } from 'erdjs-vue/constants/network';
import { useDappStore, defaultNetwork } from 'erdjs-vue/store/erdjsDapp';
import { sendTransactions } from 'erdjs-vue/services/transactions/sendTransactions';
import type { SimpleTransactionType } from 'erdjs-vue/types';
import { useAccountStore } from 'erdjs-vue/store/erdjsAccountInfo';
import { useLoginInfoStore } from 'erdjs-vue/store/erdjsLoginInfo';
import { useNotificationsStore } from 'erdjs-vue/store/erdjsNotifications';
import { useNetworkProviderStore } from 'erdjs-vue/store/erdjsProvider';
import { useTransactionsStore } from 'erdjs-vue/store/erdjsTransactions';
import { useTransactionsInfoStore } from 'erdjs-vue/store/erdjsTransactionsInfo';

import {
  fetchAccount,
  initializeProvider
} from 'erdjs-vue/hooks/login/login';
import { transactionSender } from 'erdjs-vue/hooks/transactions/transactionsSender';
import { ref, watch } from "vue";
import { sendSignedTransactions } from 'erdjs-vue/apiCalls/transactions';
import { useToastsStore } from './store/erdjsToasts';
import { logout as logoutAction } from 'erdjs-vue/utils/logout'
import { useWebViewLogin } from 'erdjs-vue/hooks/login/useWebViewLogin'
import { type AppConfig, setAppConfig } from 'erdjs-vue/utils/app/appConfig';
import { storeToRefs } from 'pinia';

export interface DappType {
  init: void,
  initializeNetworkConfig: void,
  getNetworkConfig: typeof defaultNetwork,
  getDappStore: typeof useDappStore,
  getAccountStore: typeof useAccountStore,
}

export default class Dapp {
  private environment: 'testnet' | 'mainnet' | 'devnet' | EnvironmentsEnum;
  private customNetworkConfig: {};
  private appConfiguration: AppConfig;

  constructor(environment: EnvironmentsEnum, customNetworkConfig = {}, appConfig: AppConfig) {
    if (!environment) {
      //throw if the user tries to initialize the app without a valid environment.
      throw new Error('missing environment flag');
    }

    this.environment = environment;
    this.customNetworkConfig = {
      ...customNetworkConfig
    }
    this.appConfiguration = {
      ...appConfig
    }
  }

  init() {
    const fallbackConfig = fallbackNetworkConfigurations[this.environment] || {};

    const localConfig = {
      ...fallbackConfig,
      ...this.customNetworkConfig
    };

    this.initializeNetworkConfig(localConfig)
    this.setupWatchers()
    setAppConfig(this.appConfiguration);

    useWebViewLogin();
  }

  initializeNetworkConfig(options: NetworkType) {
    const store = useDappStore();
    store.updateNetworkConfig(options);
    store.updateChainId(options.chainId);
  }

  setupWatchers() {
    const { getAddress } = storeToRefs(useAccountStore());

    const { isLoggedIn } = storeToRefs(useLoginInfoStore());

    watch([getAddress, isLoggedIn], () => {
      fetchAccount(getAddress.value, isLoggedIn.value);
    }, {
      immediate: true
    })

    const { loginMethod } = storeToRefs(useLoginInfoStore());

    watch(loginMethod, () => {
      initializeProvider(loginMethod.value);
    }, {
      immediate: true
    })

    transactionSender({ sendSignedTransactionsAsync: sendSignedTransactions });
  }

  getNetworkConfig() {
    const store = useDappStore();

    return store.getNetworkConfig;
  }

  getDappStore() {
    return useDappStore();
  }

  getAccountStore() {
    return useAccountStore();
  }

  getLoginInfoStore() {
    return useLoginInfoStore();
  }

  getNotificationsStore() {
    return useNotificationsStore();
  }

  getProviderStore() {
    return useNetworkProviderStore();
  }

  getToastsStore() {
    return useToastsStore();
  }

  getTransactionsStore() {
    return useTransactionsStore();
  }

  getTransactionsInfoStore() {
    return useTransactionsInfoStore();
  }

  async sendTransaction(transaction: SimpleTransactionType) {
    return await sendTransactions({
      transactions: [transaction],
      signWithoutSending: false,
      transactionsDisplayInfo: {
        errorMessage: ''
      }
    });
  }

  logout(
    callbackUrl?: string,
    onRedirect?: (callbackUrl?: string) => void
  ) {
    logoutAction(callbackUrl, onRedirect);
  }
}