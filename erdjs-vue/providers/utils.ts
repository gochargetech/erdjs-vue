import type { SignableMessage, Transaction } from '@multiversx/sdk-core';
import { ExtensionProvider } from '@multiversx/sdk-extension-provider';
import { HWProvider } from '@multiversx/sdk-hw-provider';
import type { IHWWalletApp } from '@multiversx/sdk-hw-provider/out/interface';

import type {
  // @ts-ignore
  EngineTypes,
} from '@multiversx/sdk-wallet-connect-provider';
import { WalletConnectV2Provider } from '@multiversx/sdk-wallet-connect-provider/out/walletConnectV2Provider';
import { WalletProvider } from '@multiversx/sdk-web-wallet-provider';
import { LEDGER_CONTRACT_DATA_ENABLED_VALUE } from 'erdjs-vue/constants/index';
import type { IDappProvider } from 'erdjs-vue/types';
import { LoginMethodsEnum } from 'erdjs-vue/types/enums.types';

export const DAPP_INIT_ROUTE = '/dapp/init';

export const getProviderType = <TProvider extends Object>(
  provider?: TProvider | null
): LoginMethodsEnum => {
  switch (provider?.constructor) {
    case WalletProvider:
      return LoginMethodsEnum.wallet;
    case WalletConnectV2Provider:
      return LoginMethodsEnum.walletconnectv2;
    case HWProvider:
      return LoginMethodsEnum.ledger;
    case ExtensionProvider:
      return LoginMethodsEnum.extension;
    case EmptyProvider:
      return LoginMethodsEnum.none;
    default:
      return LoginMethodsEnum.extra;
  }
};

export const newWalletProvider = (walletAddress: string) =>
  new WalletProvider(`${walletAddress}${DAPP_INIT_ROUTE}`);

export const getLedgerConfiguration = async (
  initializedHwWalletP: HWProvider
) => {
  if (!initializedHwWalletP.isInitialized()) {
    throw new Error('Unable to get version. Provider not initialized');
  }
  const hwApp: IHWWalletApp = (initializedHwWalletP as any).hwApp;
  const { contractData, version } = await hwApp.getAppConfiguration();
  const dataEnabled = contractData === LEDGER_CONTRACT_DATA_ENABLED_VALUE;
  return { version, dataEnabled };
};

const notInitializedError = (caller: string) => {
  return `Unable to perform ${caller}, Provider not initialized`;
};

export class EmptyProvider implements IDappProvider {
  init(): Promise<boolean> {
    return Promise.resolve(false);
  }

  login<TOptions = { callbackUrl?: string } | undefined, TResponse = string>(
    options?: TOptions
  ): Promise<TResponse> {
    throw new Error(notInitializedError(`login with options: ${options}`));
  }

  logout<TOptions = { callbackUrl?: string }, TResponse = boolean>(
    options?: TOptions
  ): Promise<TResponse> {
    throw new Error(notInitializedError(`logout with options: ${options}`));
  }

  getAddress(): Promise<string> {
    throw new Error(notInitializedError('getAddress'));
  }

  isInitialized(): boolean {
    return false;
  }

  isConnected(): Promise<boolean> {
    return Promise.resolve(false);
  }

  sendTransaction?<
    TOptions = { callbackUrl?: string },
    TResponse = Transaction
  >(transaction: Transaction, options?: TOptions): Promise<TResponse> {
    throw new Error(
      notInitializedError(
        `sendTransaction with transactions: ${transaction} options: ${options}`
      )
    );
  }

  signTransaction<TOptions = { callbackUrl?: string }, TResponse = Transaction>(
    transaction: Transaction,
    options?: TOptions
  ): Promise<TResponse> {
    throw new Error(
      notInitializedError(
        `signTransaction with transactions: ${transaction} options: ${options}`
      )
    );
  }

  signTransactions<TOptions = { callbackUrl?: string }, TResponse = []>(
    transactions: [],
    options?: TOptions
  ): Promise<TResponse> {
    throw new Error(
      notInitializedError(
        `signTransactions with transactions: ${transactions} options: ${options}`
      )
    );
  }

  signMessage<T extends SignableMessage, TOptions = { callbackUrl?: string }>(
    message: T,
    options: TOptions
  ): Promise<T> {
    throw new Error(
      notInitializedError(
        `signTransactions with ${message} and options ${options}`
      )
    );
  }

  sendCustomMessage?({
    method,
    params
  }: {
    method: string;
    params: any;
  }): Promise<any> {
    throw new Error(
      notInitializedError(
        `sendCustomMessage with method: ${method} params: ${params}`
      )
    );
  }

  sendCustomRequest?(options?: {
    request: EngineTypes.RequestParams['request'];
  }): Promise<any> {
    throw new Error(
      notInitializedError(`sendSessionEvent with options: ${options}`)
    );
  }

  ping?(): Promise<boolean> {
    return Promise.resolve(false);
  }
}

export const emptyProvider = new EmptyProvider();
