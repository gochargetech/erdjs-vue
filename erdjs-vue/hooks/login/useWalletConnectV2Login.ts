import { useGetAccountProvider } from 'erdjs-vue/hooks/account/useGetAccountProvider';
import { setAccountProvider } from 'erdjs-vue/providers/accountProvider';
import { logout } from 'erdjs-vue/utils/logout';
import { getIsProviderEqualTo } from 'erdjs-vue/utils/account/getIsProviderEqualTo';
import { useNetworkProviderStore } from 'erdjs-vue/store/erdjsProvider';
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

import { ref, watch } from 'vue';
import type { Ref } from 'vue';
import { storeToRefs } from 'pinia';

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
  uriDeepLink: Ref<string>;
  cancelLogin: () => void;
  connectExisting: (pairing: PairingTypes.Struct) => Promise<void>;
  removeExistingPairing: (topic: string) => Promise<void>;
  walletConnectUri: Ref<string>;
  wcPairings?: PairingTypes.Struct[];
  getWcPairings: () => PairingTypes.Struct[];
}

export type WalletConnectV2LoginHookReturnType = [
  (loginProvider?: boolean) => void,
  LoginHookGenericStateType,
  WalletConnectV2LoginHookCustomStateType,
];

export const useWalletConnectV2Login = ({
  logoutRoute,
  callbackRoute,
  token: tokenToSign,
  onLoginRedirect
}: InitWalletConnectV2Type): WalletConnectV2LoginHookReturnType => {
  const token = tokenToSign;

  const isLoading = ref<boolean>(true);
  const wcUri = ref<string>('');
  const wcPairings = ref<PairingTypes.Struct[]>([]);
  const error = ref<string>('');
  const uriDeepLink = ref<string>('');

  const networkProviderStore = useNetworkProviderStore();
  const { getWalletConnectUri } = storeToRefs(networkProviderStore);

  const { provider } = useGetAccountProvider();

  useNetworkProviderStore().setCurrent(provider);
  const walletConnectV2RelayAddress = useDappStore().getWalletConnectV2RelaySelector;
  const walletConnectV2ProjectId = useDappStore().getWalletConnectV2ProjectIdSelector;
  const walletConnectV2Options = useDappStore().getWalletConnectV2OptionsSelector;
  const chainId = useDappStore().getChainId;
  const walletConnectDeepLink = useDappStore().getWalletConnectDeepLink;

  uriDeepLink.value = !isLoading.value
    ? `${walletConnectDeepLink}?wallet-connect=${encodeURIComponent(wcUri.value)}`
    : '';

  // wcUri watcher
  watch(wcUri, (newVal) => {
    isLoading.value = !newVal;
  }, {
    immediate: true
  })

  // getWalletConnectUri watcher. Generate deep link for xPortal app.
  watch(getWalletConnectUri, (newVal) => {
    uriDeepLink.value = `${walletConnectDeepLink}?wallet-connect=${encodeURIComponent(newVal)}`;
  }, {
    immediate: true
  })

  const handleOnLogout = () => {
    logout(logoutRoute);
  };

  const handleOnEvent = (event: SessionEventTypes['event']) => {
    console.log('wc2 session event: ', event);
  };

  const cancelLogin = () => {
    alert('cancel login')
  };

  const getWcPairings = () => {
    return wcPairings.value
  };

  const handleOnLogin = async () => {
    try {
      const currentProvider = useNetworkProviderStore().getCurrent;
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
        useLoginInfoStore().setWalletConnectV2Login(loginData);
        useLoginInfoStore().setTokenLoginSignature(signature);
      } else {
        useLoginInfoStore().setWalletConnectV2Login(loginData);
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
      // eslint-disable-next-line no-unsafe-optional-chaining
      const { uri, approval } = await useNetworkProviderStore().getCurrent?.connect();
      const hasUri = Boolean(uri);

      if (!hasUri) {
        return;
      }

      wcUri.value = uri;
      useNetworkProviderStore().setWalletConnectUri(wcUri.value);

      try {
        // @ts-ignore
        // eslint-disable-next-line no-unsafe-optional-chaining
        await useNetworkProviderStore().getCurrent?.login({ approval, token });
      } catch (err) {
        error.value = WalletConnectV2Error.userRejected;
        isLoading.value = true;

        await initiateLogin();
      }

    } catch (err) {
      error.value = WalletConnectV2Error.userRejected;
    }

    const hasUri = Boolean(wcUri.value);

    if (!hasUri) {
      return;
    }

    if (!token) {
      return;
    }

    const wcUriWithToken = `${wcUri.value}&token=${token}`;

    useNetworkProviderStore().setWalletConnectUri(wcUriWithToken);
    // useLoginInfoStore().setTokenLogin({ loginToken: token });
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
    useNetworkProviderStore().setCurrent(newProvider);
    setAccountProvider(newProvider);
    // @ts-ignore
    wcPairings.value = newProvider.pairings;

    if (loginProvider) {
      await generateWalletConnectUri();
    }
  }

  const loginFailed = Boolean(error.value);

  const connectExisting = async (pairing: PairingTypes.Struct) => {
    if (!walletConnectV2RelayAddress || !walletConnectV2ProjectId) {
      error.value = WalletConnectV2Error.invalidConfig;
      return;
    }
    if (!pairing || !pairing.topic) {
      error.value = WalletConnectV2Error.invalidTopic;
      return;
    }

    try {
      // @ts-ignore
      // eslint-disable-next-line no-unsafe-optional-chaining
      const { approval } = await useNetworkProviderStore().getCurrent?.connect({
        topic: pairing.topic
      });

      try {
        // @ts-ignore
        await useNetworkProviderStore().getCurrent?.login({ approval });
      } catch (err) {
        error.value = WalletConnectV2Error.userRejectedExisting;
        isLoading.value = true;

        await initiateLogin();
      }
    } catch (err) {
      console.error(WalletConnectV2Error.sessionExpired, err);
      error.value = WalletConnectV2Error.sessionExpired;
    } finally {
      // @ts-ignore
      wcPairings.value = useNetworkProviderStore().getCurrent?.pairings;
    }
  };

  const removeExistingPairing = async (topic: string) => {
    try {
      if (topic) {
        // @ts-ignore
        await useNetworkProviderStore().getCurrent?.logout({
          topic
        });
      }
    } catch (err) {
      console.error(WalletConnectV2Error.errorLogout, err);
      error.value = WalletConnectV2Error.errorLogout;
      alert(error.value);
    } finally {
      if (topic) {
        // @ts-ignore
        const prs = useNetworkProviderStore().getCurrent?.pairings;

        // @ts-ignore
        wcPairings.value = prs.filter((p) => {
          return p.topic !== topic;
        })
      } else {
        // @ts-ignore
        wcPairings.value = useNetworkProviderStore().getCurrent?.pairings;
      }
    }
  };

  return [
    initiateLogin,
    {
      loginFailed,
      error: error.value,
      isLoading: isLoading.value,
      isLoggedIn: false,
    },
    {
      uriDeepLink,
      walletConnectUri: wcUri,
      cancelLogin,
      connectExisting,
      removeExistingPairing,
      getWcPairings
    }
  ];
};
