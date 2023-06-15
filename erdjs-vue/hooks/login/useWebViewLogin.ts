import { useAppConfigStore } from 'erdjs-vue/store/erdjsAppConfig';
import { getWebviewToken } from 'erdjs-vue/utils/account/getWebviewToken';
import { loginWithNativeAuthToken } from 'erdjs-vue/services/nativeAuth/helpers/loginWithNativeAuthToken';

export function useWebViewLogin(accessToken: string = '') {
  const shouldUseWebViewProvider = useAppConfigStore().getShouldUseWebViewProvider;
  const token = accessToken ? accessToken : getWebviewToken();

  if (!shouldUseWebViewProvider) {
    return;
  }

  loginWithNativeAuthToken(token);
}
