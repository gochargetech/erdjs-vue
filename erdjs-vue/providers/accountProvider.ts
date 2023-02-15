// Last synced with @elrondnetwork/dapp-core version 2.1.16
// 2022-11-30

import type { WalletProvider } from '@multiversx/sdk-web-wallet-provider';
import type { ExtensionProvider } from '@multiversx/sdk-extension-provider';
import type { HWProvider } from '@multiversx/sdk-hw-provider';
import type { WalletConnectProvider, WalletConnectV2Provider } from '@multiversx/sdk-wallet-connect-provider';
import type { IDappProvider } from 'erdjs-vue/types';
import { emptyProvider } from 'erdjs-vue/providers/utils';

export type ProvidersType =
  | IDappProvider
  | WalletProvider
  | ExtensionProvider
  | HWProvider
  | WalletConnectProvider
  | WalletConnectV2Provider;

let accountProvider: ProvidersType = emptyProvider;

export function setAccountProvider<TProvider extends ProvidersType>(
  provider: TProvider
) {
  accountProvider = provider;
}

export function getAccountProvider(): ProvidersType {
  return (accountProvider as ProvidersType) || emptyProvider;
}
