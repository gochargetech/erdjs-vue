import { getAccountProvider, getProviderType } from 'erdjs-vue/providers';
import { LoginMethodsEnum } from 'erdjs-vue/types';
import { getIsLoggedIn } from 'erdjs-vue/utils/getIsLoggedIn';
import { useLoginInfoStore } from 'erdjs-vue/store/erdjsLoginInfo'
import { useAccountStore } from 'erdjs-vue/store/erdjsAccountInfo'
import { preventRedirects, safeRedirect } from 'erdjs-vue/utils/redirect';

export async function logout(
  callbackUrl?: string,
  onRedirect?: (callbackUrl?: string) => void
) {
  const provider = getAccountProvider();
  const providerType = getProviderType(provider);
  const isLoggedIn = getIsLoggedIn();
  const isWalletProvider = providerType === LoginMethodsEnum.wallet;

  if (!isLoggedIn || !provider) {
    redirectToCallbackUrl(callbackUrl, onRedirect, false);
    return;
  }

  if (isWalletProvider) {
    preventRedirects();
  }

  try {
    const needsCallbackUrl = isWalletProvider && !callbackUrl;
    const url = needsCallbackUrl ? window.location.origin : callbackUrl;

    if (isWalletProvider) {
      useLoginInfoStore().logout();
      useAccountStore().logout();

      // allow Redux clearing it's state before navigation
      setTimeout(() => {
        // @ts-ignore
        provider.logout({ callbackUrl: url });
      });
    } else {
      await provider.logout();

      useLoginInfoStore().logout();
      useAccountStore().logout();

      redirectToCallbackUrl(callbackUrl, onRedirect, isWalletProvider);
    }
  } catch (err) {
    console.error('error logging out', err);
  }
}

function redirectToCallbackUrl(
  callbackUrl?: string,
  onRedirect?: (callbackUrl?: string) => void,
  isWalletProvider?: boolean
) {
  if (callbackUrl && !isWalletProvider) {
    if (typeof onRedirect === 'function') {
      onRedirect(callbackUrl);
    } else {
      safeRedirect(callbackUrl);
    }
  }
}
