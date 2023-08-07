import type { WalletProvider } from '@multiversx/sdk-web-wallet-provider';
import type { ExtensionProvider } from '@multiversx/sdk-extension-provider';
import type { HWProvider } from '@multiversx/sdk-hw-provider';
import type { WalletConnectV2Provider } from '@multiversx/sdk-wallet-connect-provider';
import type { IDappProvider } from 'erdjs-vue/types';
import { emptyProvider } from 'erdjs-vue/providers/utils';

export type ProvidersType =
  | IDappProvider
  | WalletProvider
  | ExtensionProvider
  | HWProvider
  | WalletConnectV2Provider;

let accountProvider: ProvidersType = emptyProvider;

let externalProvider: IDappProvider | null = null;

export function setAccountProvider<TProvider extends ProvidersType>(
  provider: TProvider
) {
  accountProvider = provider;
}

export function setExternalProvider(provider: IDappProvider) {
  externalProvider = provider;
}

export function setExternalProviderAsAccountProvider() {
  if (externalProvider != null) {
    accountProvider = externalProvider;
  }
}

export function getAccountProvider(): ProvidersType {
  return (accountProvider as ProvidersType) || emptyProvider;
}

export function getExternalProvider() {
  return externalProvider;
}