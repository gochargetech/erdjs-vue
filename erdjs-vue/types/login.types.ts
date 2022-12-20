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

export interface OnProviderLoginType {
  callbackRoute?: string;
  token?: string;
  /**
   * If specified, `onLoginRedirect` will overwrite callbackRoute default navigation
   */
  onLoginRedirect?: OnLoginRedirectType;
}

export interface LoginActionPayloadType {
  address: string;
  loginMethod: LoginMethodsEnum;
}