import { logout } from 'erdjs-vue/utils/logout';
import { useAccountStore } from 'erdjs-vue/store/erdjsAccountInfo';
import { useLoginInfoStore } from 'erdjs-vue/store/erdjsLoginInfo';
import { LoginMethodsEnum } from 'erdjs-vue/types';
import { decodeNativeAuthToken } from './decodeNativeAuthToken';

export async function loginWithNativeAuthToken(token: string) {
  const nativeAuthInfo = decodeNativeAuthToken(token);
  if (nativeAuthInfo == null) {
    return;
  }

  const { signature, address } = nativeAuthInfo;
  if (signature && token && address) {
    // this will clear out the store from all previous logins
    await logout();

    useLoginInfoStore().setTokenLogin({
      loginToken: token,
      signature,
      nativeAuthToken: token
    });

    const loginActionData = { address, loginMethod: LoginMethodsEnum.extra };
    useAccountStore().setLogin(loginActionData);
    useLoginInfoStore().setLoginMethod(LoginMethodsEnum.extra)
  }
}
