import { SECOND_LOGIN_ATTEMPT_ERROR } from 'erdjs-vue/constants/errorsMessages';

import type {
  InitiateLoginFunctionType,
  LoginHookGenericStateType,
  OnProviderLoginType
} from 'erdjs-vue/types';
import { getIsLoggedIn } from 'erdjs-vue/utils/getIsLoggedIn';
import { newWalletProvider } from 'erdjs-vue/providers/utils';
import { useDappStore } from 'erdjs-vue/store/erdjsDapp';
import { useLoginInfoStore } from 'erdjs-vue/store/erdjsLoginInfo';
import { setAccountProvider } from 'erdjs-vue/providers/accountProvider';
import { getAddress, getAccount, getLatestNonce } from 'erdjs-vue/utils/account';
import { useAccountStore } from 'erdjs-vue/store/erdjsAccountInfo';
import { LoginMethodsEnum } from 'erdjs-vue/types/index'

export interface UseWebWalletLoginPropsType
  extends Omit<OnProviderLoginType, 'onLoginRedirect'> {
  redirectDelayMilliseconds?: number;
}

export type UseWebWalletLoginReturnType = [
  InitiateLoginFunctionType,
  LoginHookGenericStateType
];

export const useWebWalletLogin = ({
  callbackRoute,
  token,
  redirectDelayMilliseconds = 100
}: UseWebWalletLoginPropsType): UseWebWalletLoginReturnType => {
  const isLoggedIn = getIsLoggedIn();
  let errorMessage = '';
  const isLoading = false;

  async function initiateLogin() {
    if (isLoggedIn) {
      throw new Error(SECOND_LOGIN_ATTEMPT_ERROR);
    }

    try {
      const network = useDappStore().getNetworkConfig;
      const provider = newWalletProvider(network.walletAddress);

      const now = new Date();
      const expires: number = now.setMinutes(now.getMinutes() + 3) / 1000;
      const walletLoginData = {
        data: {},
        expires: expires
      };

      useLoginInfoStore().setWalletLogin(walletLoginData);
      useLoginInfoStore().setLoginMethod(LoginMethodsEnum.wallet)
      if (token) {
        useLoginInfoStore().setTokenLogin({ loginToken: token });
      }
      const callbackUrl: string = encodeURIComponent(
        `${window.location.origin}${callbackRoute}`
      );
      const loginData = {
        callbackUrl: callbackUrl,
        ...(token && { token }),
        redirectDelayMilliseconds
      };

      await provider.login(loginData);
    } catch (error) {
      console.error('error loging in', error);
      errorMessage = 'error logging in' + (error as any).message;
    } finally {
      // setIsLoading(false);
    }
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
    }
  ];
};

export async function tryAuthenticateWalletUser() {
  const network = useDappStore().getNetworkConfig;

  if (useLoginInfoStore().getLoginMethod == LoginMethodsEnum.wallet) {

    const provider = newWalletProvider(network.walletAddress);
    setAccountProvider(provider);
    try {
      const address = await getAddress();
      if (address) {
        useAccountStore().setLogin({ address, loginMethod: LoginMethodsEnum.wallet });
        const account = await getAccount(address);
        if (account) {
          useAccountStore().setAccount({
            ...account,
            nonce: getLatestNonce(account)
          });
        }
      }
      parseWalletSignature();
    } catch (e) {
      console.error('Failed authenticating wallet user ', e);
    }

    useLoginInfoStore().setWalletLogin(null)
    useLoginInfoStore().setLoginMethod(LoginMethodsEnum.wallet)
  }
}

function parseWalletSignature() {
  let params: any = {};
  if (window?.location?.search) {
    const urlSearchParams = new URLSearchParams(window.location.search);
    params = Object.fromEntries(urlSearchParams as any);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { signature, loginToken, address, ...remainingParams } = params;

  if (signature) {
    useLoginInfoStore().setTokenLoginSignature(signature);
  }
  clearWalletLoginHistory(remainingParams);
}

function clearWalletLoginHistory(remainingParams: any) {
  const newUrlParams = new URLSearchParams(remainingParams).toString();
  const { pathname } = window.location;
  const newSearch = newUrlParams ? `?${newUrlParams}` : '';
  const fullPath = pathname ? `${pathname}${newSearch}` : './';
  window.history.replaceState({}, document?.title, fullPath);
}