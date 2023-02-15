import { getAccount } from 'erdjs-vue/utils/account';
import { useAccountStore } from 'erdjs-vue/store/erdjsAccountInfo';
import { useLoginInfoStore } from 'erdjs-vue/store/erdjsLoginInfo';
import { LoginMethodsEnum } from 'erdjs-vue/types/index'
import { tryAuthenticateWalletUser } from 'erdjs-vue/hooks/login/useWebWalletLogin'
import { setExtensionProvider } from 'erdjs-vue/hooks/login/useExtensionLogin'
import { useWalletConnectLogin } from 'erdjs-vue/hooks/login/useWalletConnectLogin';
import { useWalletConnectV2Login } from 'erdjs-vue/hooks/login/useWalletConnectV2Login';

export async function fetchAccount(address: string, isLoggedIn: boolean) {
  // dispatch(setIsAccountLoading(true));
  if (address && isLoggedIn) {
    try {
      const account = await getAccount(address);
      if (account) {
        useAccountStore().setAccount({
          ...account,
          address,
          nonce: account.nonce.valueOf()
        });
      }
    } catch (e) {
      // dispatch(setAccountLoadingError('Failed getting account'));
      console.error('Failed getting account ', e);
    }
  }
  // dispatch(setIsAccountLoading(false));
}

export function initializeProvider(loginMethod: LoginMethodsEnum | null) {
  if (loginMethod == null) {
    return;
  }

  switch (loginMethod) {
    case LoginMethodsEnum.ledger: {
      console.log('ledger');
      break;
    }

    case LoginMethodsEnum.walletconnect: {
      const walletConnectLogin = useLoginInfoStore().getWalletConnectLogin;
      const { callbackRoute, logoutRoute } = walletConnectLogin
        ? walletConnectLogin
        : { callbackRoute: '', logoutRoute: '' };

      const [initWalletLoginProvider] = useWalletConnectLogin({
        callbackRoute,
        logoutRoute
      });

      initWalletLoginProvider(false);
      break;
    }

    case LoginMethodsEnum.walletconnectv2: {
      const [initWalletConnectV2LoginProvider] = useWalletConnectV2Login({
        logoutRoute: '/login',
        callbackRoute: '/login'
      });
      initWalletConnectV2LoginProvider(false);
      console.log('walletconnect v2');
      break;
    }

    case LoginMethodsEnum.extension: {
      setExtensionProvider()
      break;
    }

    case LoginMethodsEnum.extra: {
      console.log('extra');
      break;
    }

    case LoginMethodsEnum.wallet:
    case LoginMethodsEnum.none: {
      tryAuthenticateWalletUser();
      break;
    }

    default:
      return;
  }
}