import { webviewProvider } from 'erdjs-vue/providers/webviewProvider/webviewProvider'
import { setExternalProvider } from 'erdjs-vue/providers/accountProvider';
import { useAppConfigStore } from 'erdjs-vue/store/erdjsAppConfig';
import type { OnProviderLoginType } from 'erdjs-vue/types';
import type { InitWalletConnectV2Type } from 'erdjs-vue/hooks/login/useWalletConnectV2Login';

export interface AppConfig {
  shouldUseWebViewProvider: boolean,
  withGuardianInfo: boolean,
  extensionLogin: OnProviderLoginType,
  ledgerLogin: OnProviderLoginType,
  walletConnectV2Login: InitWalletConnectV2Type,
  webWalletLogin: OnProviderLoginType,
}

export const emptyAppConfig: AppConfig = {
  shouldUseWebViewProvider: true,
  withGuardianInfo: true,
  extensionLogin: {
    callbackRoute: '/'
  },
  ledgerLogin: {
    callbackRoute: '/',
  },
  walletConnectV2Login: {
    callbackRoute: '/',
    logoutRoute: '/login'
  },
  webWalletLogin: {
    callbackRoute: '/'
  },
}

export const setAppConfig = (appConfig: AppConfig) => {
  if (appConfig?.shouldUseWebViewProvider) {
    setExternalProvider(webviewProvider);
  }

  useAppConfigStore().setShouldUseWebViewProvider(appConfig?.shouldUseWebViewProvider);
  useAppConfigStore().setWithGuardianInfo(appConfig?.withGuardianInfo);

  // Make sure to fallback to empty state to avoid undefined varioable errors
  useAppConfigStore().setExtensionLogin({
    ...emptyAppConfig.extensionLogin,
    ...appConfig.extensionLogin
  });
  useAppConfigStore().setLedgerLogin({
    ...emptyAppConfig.ledgerLogin,
    ...appConfig.ledgerLogin
  });
  useAppConfigStore().setWalletConnectV2Login({
    ...emptyAppConfig.walletConnectV2Login,
    ...appConfig.walletConnectV2Login
  });
  useAppConfigStore().setWebWalletLogin({
    ...emptyAppConfig.webWalletLogin,
    ...appConfig.webWalletLogin
  });
};
