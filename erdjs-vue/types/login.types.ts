import type { LoginMethodsEnum } from 'erdjs-vue/types/index'

export interface LoginHookGenericStateType {
  error: string;
  loginFailed: boolean;
  isLoading: boolean;
  isLoggedIn: boolean;
}

export type InitiateLoginFunctionType = () => void;

export type LoginHookReturnType = [
  LoginHookReturnType,
  LoginHookGenericStateType
];

export interface OnLoginRedirectOptionsType {
  signature?: string;
  address: string;
}

export type OnLoginRedirectType = (
  callbackRoute: string,
  options?: OnLoginRedirectOptionsType
) => void;

export interface NativeAuthConfigType {
  hostname?: string;
  apiAddress?: string;
  expirySeconds?: number;
  /**
   * Displays a logout toast warning before token expiration. Defaults to 5 minutes.
   *
   * If set to `null`, will not trigger any warning.
   */
  tokenExpirationToastWarningSeconds?: number | null;
}

export interface OnProviderLoginType {
  callbackRoute?: string;
  token?: string;
  /**
   * If specified, `onLoginRedirect` will overwrite callbackRoute default navigation
   */
  onLoginRedirect?: OnLoginRedirectType;
  /**
   * If set to `true`, will fallback on default configuration
   */
  nativeAuth?: NativeAuthConfigType | boolean;
}

export interface LoginActionPayloadType {
  address: string;
  loginMethod: LoginMethodsEnum;
}