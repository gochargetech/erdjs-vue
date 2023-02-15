import { useGetAccountProvider } from 'erdjs-vue/hooks/account/useGetAccountProvider';
import { setAccountProvider } from 'erdjs-vue/providers/accountProvider';
import { logout } from 'erdjs-vue/utils/logout';
import { getIsProviderEqualTo } from 'erdjs-vue/utils/account/getIsProviderEqualTo';
import { useNetworkProviderStore } from 'erdjs-vue/store/erdjsProvider';
import { WalletConnectProvider } from '@multiversx/sdk-wallet-connect-provider';
import type {
  LoginHookGenericStateType,
  OnProviderLoginType
} from 'erdjs-vue/types';
import { getIsLoggedIn } from 'erdjs-vue/utils/getIsLoggedIn';
import { useDappStore } from 'erdjs-vue/store/erdjsDapp';
import { useLoginInfoStore } from 'erdjs-vue/store/erdjsLoginInfo';
import { optionalRedirect } from 'erdjs-vue/utils/internal';
import { useAccountStore } from 'erdjs-vue/store/erdjsAccountInfo';
import { LoginMethodsEnum } from 'erdjs-vue/types/index'

import { ref, watch } from 'vue';
import type { Ref } from 'vue';
import { storeToRefs } from 'pinia';

export interface InitWalletConnectType extends OnProviderLoginType {
  logoutRoute: string;
}

export interface WalletConnectLoginHookCustomStateType {
  uriDeepLink: string;
  walletConnectUri: Ref<string>;
}

export type WalletConnectLoginHookReturnType = [
  (loginProvider?: boolean) => void,
  LoginHookGenericStateType,
  WalletConnectLoginHookCustomStateType
];

export const useWalletConnectLogin = ({
  logoutRoute,
  callbackRoute,
  token,
  onLoginRedirect
}: InitWalletConnectType): WalletConnectLoginHookReturnType => {
  let errorMessage = '';
  const walletConnectUri = ref<string>('');

  const networkProviderStore = useNetworkProviderStore();
  const { getWalletConnectUri } = storeToRefs(networkProviderStore);

  // getWalletConnectUri watcher. Generate deep link for xPortal app.
  watch(getWalletConnectUri, (newVal) => {
    walletConnectUri.value = newVal;
  }, {
    immediate: true
  })

  const { provider } = useGetAccountProvider();

  useNetworkProviderStore().setCurrent(provider);
  const walletConnectBridgeAddress = useDappStore().getWalletConnectBridgeAddress;
  const walletConnectDeepLink = useDappStore().getWalletConnectDeepLink;

  let heartbeatDisconnectInterval: NodeJS.Timeout;

  // walletConnectUri.value = useNetworkProviderStore().getWalletConnectUri;
  const hasWalletConnectUri = Boolean(walletConnectUri.value);
  const isLoading = !hasWalletConnectUri;

  let uriDeepLink = hasWalletConnectUri
    ? `${walletConnectDeepLink}?wallet-connect=${encodeURIComponent(walletConnectUri.value)}`
    : '';

  const handleOnLogout = () => {
    logout(logoutRoute);
  };

  async function handleOnLogin() {
    try {
      const currentProvider = useNetworkProviderStore().getCurrent;
      const isLoggedIn = getIsLoggedIn();

      if (
        isLoggedIn ||
        currentProvider == null ||
        !getIsProviderEqualTo(LoginMethodsEnum.walletconnect)
      ) {
        return;
      }

      // @ts-ignore
      const address = await currentProvider.getAddress();
      if (!address) {
        console.warn('Login cancelled.');
        return;
      }

      // @ts-ignore
      const signature = await currentProvider.getSignature();
      const hasSignature = Boolean(signature);

      const loginActionData = {
        address: address,
        loginMethod: LoginMethodsEnum.walletconnect
      };
      useAccountStore().setLogin(loginActionData);

      const loginData = {
        logoutRoute: logoutRoute,
        loginType: 'walletConnect',
        callbackRoute: callbackRoute ?? window.location.href
      };

      if (hasSignature) {
        useLoginInfoStore().setWalletConnectLogin(loginData);
        useLoginInfoStore().setTokenLoginSignature(signature);
      } else {
        useLoginInfoStore().setWalletConnectLogin(loginData);
      }

      // @ts-ignore
      currentProvider.walletConnector.on('heartbeat', () => {
        clearInterval(heartbeatDisconnectInterval);
        heartbeatDisconnectInterval = setInterval(() => {
          console.log('Maiar Wallet Connection Lost');
          handleOnLogout();
          clearInterval(heartbeatDisconnectInterval);
        }, 150000);
      });

      optionalRedirect({
        callbackRoute,
        onLoginRedirect,
        options: { address, signature }
      });
    } catch (err) {
      errorMessage = 'Invalid address';
      console.error(err);
    }
  }

  async function generateWalletConnectUri() {
    if (!walletConnectBridgeAddress) {
      return;
    }

    // @ts-ignore
    const uri: string = await useNetworkProviderStore().getCurrent?.login();
    useNetworkProviderStore().setWalletConnectUri(uri);

    const hasUri = Boolean(uri);

    if (!hasUri) {
      return;
    }

    if (!token) {
      return;
    }

    const wcUriWithToken = `${uri}&token=${token}`;

    useNetworkProviderStore().setWalletConnectUri(wcUriWithToken);
    useLoginInfoStore().setTokenLogin({ loginToken: token });
  }

  async function initiateLogin(loginProvider = true) {
    const shouldGenerateWcUri = loginProvider && !walletConnectUri.value;

    if (
      !walletConnectBridgeAddress ||
      // @ts-ignore
      (useNetworkProviderStore().current?.isInitialized?.() && !shouldGenerateWcUri)
    ) {
      return;
    }

    const providerHandlers = {
      onClientLogin: handleOnLogin,
      onClientLogout: handleOnLogout
    };

    const newProvider = new WalletConnectProvider(
      walletConnectBridgeAddress,
      providerHandlers
    );

    await newProvider.init();
    useNetworkProviderStore().setCurrent(newProvider);

    setAccountProvider(newProvider);
    if (loginProvider) {
      await generateWalletConnectUri();
    }

    uriDeepLink = `${walletConnectDeepLink}?wallet-connect=${encodeURIComponent(useNetworkProviderStore().getWalletConnectUri)}`;

  }
  // const loginFailed = Boolean(error);
  const loginFailed = false;

  return [
    initiateLogin,
    {
      loginFailed,
      error: errorMessage,
      isLoading,
      isLoggedIn: false
    },
    { uriDeepLink, walletConnectUri }
  ];
};
