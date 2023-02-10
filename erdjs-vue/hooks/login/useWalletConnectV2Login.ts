import { useGetAccountProvider } from 'erdjs-vue/hooks/account/useGetAccountProvider';
import { setAccountProvider } from 'erdjs-vue/providers/accountProvider';
import { logout } from 'erdjs-vue/utils/logout';
import { getIsProviderEqualTo } from 'erdjs-vue/utils/account/getIsProviderEqualTo';
import { useProviderStore } from 'erdjs-vue/store/erdjsProvider';
import type {
  SessionEventTypes,
  PairingTypes
} from '@multiversx/sdk-wallet-connect-provider';
import { WalletConnectV2Provider } from '@multiversx/sdk-wallet-connect-provider/out/walletConnectV2Provider';

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

import { ref } from 'vue';

export enum WalletConnectV2Error {
  invalidAddress = 'Invalid address',
  invalidConfig = 'Invalid WalletConnect setup',
  invalidTopic = 'Expired connection',
  sessionExpired = 'Unable to connect to existing session',
  connectError = 'Unable to connect',
  userRejected = 'User rejected connection proposal',
  userRejectedExisting = 'User rejected existing connection proposal',
  errorLogout = 'Unable to remove existing pairing'
}

export interface InitWalletConnectV2Type extends OnProviderLoginType {
  logoutRoute: string;
  events?: string[];
}

export interface WalletConnectV2LoginHookCustomStateType {
  uriDeepLink: string;
  cancelLogin: () => void;
  connectExisting: (pairing: PairingTypes.Struct) => Promise<void>;
  removeExistingPairing: (topic: string) => Promise<void>;
  walletConnectUri?: string;
  wcPairings?: PairingTypes.Struct[];
}

export type WalletConnectV2LoginHookReturnType = [
  (loginProvider?: boolean) => void,
  LoginHookGenericStateType,
  WalletConnectV2LoginHookCustomStateType
];

export const useWalletConnectV2Login = ({
  logoutRoute,
  callbackRoute,
  token: tokenToSign,
  nativeAuth,
  onLoginRedirect
}: InitWalletConnectV2Type): WalletConnectV2LoginHookReturnType => {
  let errorMessage = '';
  const hasNativeAuth = nativeAuth != null;
  // const loginService = useLoginService(nativeAuth);
  const token = tokenToSign;

  const isLoading = ref<boolean>(true);
  const wcUri = ref<string>('');
  const wcPairings = ref<PairingTypes.Struct[]>([]);
  const error = ref<string>('');

  const { provider } = useGetAccountProvider();

  useProviderStore().setCurrent(provider);
  const walletConnectV2RelayAddress = useDappStore().getWalletConnectV2RelaySelector;
  const walletConnectV2ProjectId = useDappStore().getWalletConnectV2ProjectIdSelector;
  const walletConnectV2Options = useDappStore().getWalletConnectV2OptionsSelector;
  const chainId = useDappStore().getChainId;
  const walletConnectDeepLink = useDappStore().getWalletConnectDeepLink;

  let uriDeepLink = !isLoading.value
    ? `${walletConnectDeepLink}?wallet-connect=${encodeURIComponent(wcUri.value)}`
    : '';

  const handleOnLogout = () => {
    logout(logoutRoute);
  };

  const handleOnEvent = (event: SessionEventTypes['event']) => {
    console.log('wc2 session event: ', event);
  };

  const cancelLogin = () => {
    alert('cancel login')
  };
  const connectExisting = () => {
    alert('connectExisting')
  };
  const removeExistingPairing = () => {
    alert('removeExistingPairing')
  };

  async function handleOnLogin() {
    try {
      const currentProvider = useProviderStore().getCurrent;
      const isLoggedIn = getIsLoggedIn();

      if (
        isLoggedIn ||
        currentProvider == null ||
        !getIsProviderEqualTo(LoginMethodsEnum.walletconnectv2)
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
        loginMethod: LoginMethodsEnum.walletconnectv2
      };
      useAccountStore().setLogin(loginActionData);

      const loginData = {
        logoutRoute: logoutRoute,
        loginType: 'walletConnectV2',
        callbackRoute: callbackRoute ?? window.location.href
      };

      if (hasSignature) {
        useLoginInfoStore().setWalletConnectLogin(loginData);
        useLoginInfoStore().setTokenLoginSignature(signature);
      } else {
        useLoginInfoStore().setWalletConnectLogin(loginData);
      }

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
    if (!walletConnectV2RelayAddress || !walletConnectV2ProjectId) {
      error.value = WalletConnectV2Error.invalidConfig;
      return;
    }

    try {
      // @ts-ignore
      wcUri.value = await useProviderStore().getCurrent?.login();
    } catch (err) {
      error.value = WalletConnectV2Error.userRejected;
    }
    const hasUri = Boolean(wcUri.value);

    if (!hasUri) {
      return;
    }

    if (!token) {
      useProviderStore().setWalletConnectUri(wcUri.value);
      return;
    }

    const wcUriWithToken = `${wcUri.value}&token=${token}`;

    useProviderStore().setWalletConnectUri(wcUriWithToken);
    useLoginInfoStore().setTokenLogin({ loginToken: token });
  }

  async function initiateLogin(loginProvider = true) {
    if (!walletConnectV2ProjectId || !walletConnectV2RelayAddress) {
      error.value = WalletConnectV2Error.invalidConfig;
      return;
    }

    const providerHandlers = {
      onClientLogin: handleOnLogin,
      onClientLogout: handleOnLogout,
      onClientEvent: handleOnEvent
    };

    const newProvider = new WalletConnectV2Provider(
      providerHandlers,
      chainId,
      walletConnectV2RelayAddress,
      walletConnectV2ProjectId,
      walletConnectV2Options
    );


    await newProvider.init();
    useProviderStore().setCurrent(newProvider);

    setAccountProvider(newProvider);
    // @ts-ignore
    wcPairings.value = newProvider.pairings;

    if (loginProvider) {
      await generateWalletConnectUri();
    }

    uriDeepLink = `${walletConnectDeepLink}?wallet-connect=${encodeURIComponent(useProviderStore().getWalletConnectUri)}`;

  }
  const loginFailed = Boolean(error.value);

  return [
    initiateLogin,
    {
      loginFailed,
      error: errorMessage,
      isLoading: isLoading.value,
      isLoggedIn: false
    },
    {
      uriDeepLink,
      walletConnectUri: wcUri.value,
      cancelLogin,
      connectExisting,
      removeExistingPairing,
      wcPairings
    }
  ];
};
