import { SECOND_LOGIN_ATTEMPT_ERROR } from 'erdjs-vue/constants/errorsMessages';
import { setAccountProvider } from 'erdjs-vue/providers/accountProvider';
import { ExtensionProvider } from '@elrondnetwork/erdjs-extension-provider';

import type {
  InitiateLoginFunctionType,
  LoginHookGenericStateType,
  OnProviderLoginType
} from 'erdjs-vue/types';
import { LoginMethodsEnum } from 'erdjs-vue/types/enums.types';
import { getIsLoggedIn } from 'erdjs-vue/utils/getIsLoggedIn';
import { useAccountStore } from 'erdjs-vue/store/erdjsAccountInfo';
import { useLoginInfoStore } from 'erdjs-vue/store/erdjsLoginInfo';
import { optionalRedirect } from 'erdjs-vue/utils/internal';
import { getAddress } from 'erdjs-vue/utils/account';

export type UseExtensionLoginReturnType = [
  InitiateLoginFunctionType,
  LoginHookGenericStateType
];

export const useExtensionLogin = ({
  callbackRoute,
  token,
  onLoginRedirect
}: OnProviderLoginType): UseExtensionLoginReturnType => {
  const isLoggedIn = getIsLoggedIn();
  let errorMessage = '';
  const isLoading = false;

  async function initiateLogin() {
    if (isLoggedIn) {
      throw new Error(SECOND_LOGIN_ATTEMPT_ERROR);
    }

    const provider: ExtensionProvider = ExtensionProvider.getInstance();

    try {
      const isSuccessfullyInitialized: boolean = await provider.init();

      if (!isSuccessfullyInitialized) {
        console.warn(
          'Something went wrong trying to redirect to wallet login..'
        );
        return;
      }

      const callbackUrl: string = encodeURIComponent(
        `${window.location.origin}${callbackRoute ?? window.location.pathname}`
      );
      const providerLoginData = {
        callbackUrl,
        ...(token && { token })
      };

      await provider.login(providerLoginData);
      setAccountProvider(provider);

      const { signature, address } = provider.account;

      if (!address) {
        // TODO: implement error message
        console.warn('Login cancelled.');
        return;
      }

      if (signature) {
        useLoginInfoStore().setTokenLogin({
          loginToken: String(token),
          signature
        });
      }

      useAccountStore().setLogin({ address, loginMethod: LoginMethodsEnum.extension })
      useLoginInfoStore().setLoginMethod(LoginMethodsEnum.extension)

      optionalRedirect({
        callbackRoute,
        onLoginRedirect,
        options: { signature, address }
      });
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

export async function setExtensionProvider() {
  try {
    const address = await getAddress();
    const provider = ExtensionProvider.getInstance().setAddress(address);
    const success = await provider.init();

    if (success) {
      setAccountProvider(provider);
    } else {
      console.error(
        'Could not initialise extension, make sure Elrond wallet extension is installed.'
      );
    }
  } catch (err) {
    console.error('Unable to login to ExtensionProvider', err);
  }
}