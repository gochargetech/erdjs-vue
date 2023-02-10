// Last synced with @elrondnetwork/dapp-core version 2.1.16
// 2022-11-30

import type { WalletProvider } from '@multiversx/sdk-web-wallet-provider';
import type { ExtensionProvider } from '@multiversx/sdk-extension-provider';
import type { HWProvider } from '@multiversx/sdk-hw-provider';
import type { WalletConnectProvider } from '@multiversx/sdk-wallet-connect-provider';
import type { IDappProvider } from 'erdjs-vue/types';
import { emptyProvider } from 'erdjs-vue/providers/utils';
// import { useProviderStore } from 'erdjs-vue/store/erdjsProvider';

export type ProvidersType =
  | IDappProvider
  | WalletProvider
  | ExtensionProvider
  | HWProvider
  | WalletConnectProvider;

let accountProvider: ProvidersType = emptyProvider;

export function setAccountProvider<TProvider extends ProvidersType>(
  provider: TProvider
) {
  accountProvider = provider;
  // useProviderStore().setCurrent(accountProvider);
}

export function getAccountProvider(): ProvidersType {
  // const provider = useProviderStore().getCurrent;

  // return provider
  //   ? (provider as ProvidersType)
  //   : ((accountProvider as ProvidersType) || emptyProvider);

  return (accountProvider as ProvidersType) || emptyProvider;
}
