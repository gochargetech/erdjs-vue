import type { NativeAuthConfigType } from 'erdjs-vue/types/login.types';

const defaultNativeAuthConfig = {
  origin: typeof window !== 'undefined' ? window?.location?.origin : '',
  apiAddress: 'https://api.multiversx.com',
  expirySeconds: 60 * 60 * 24, // one day
  tokenExpirationToastWarningSeconds: 5 * 60 // five minutes
};

export const getNativeAuthConfig = (config?: NativeAuthConfigType | true) => {
  if (config === true) {
    return defaultNativeAuthConfig;
  }
  const nativeAuthConfig = {
    origin: config?.origin ?? defaultNativeAuthConfig.origin,
    blockHashShard: config?.blockHashShard ?? null,
    expirySeconds:
      config?.expirySeconds ?? defaultNativeAuthConfig.expirySeconds,
    apiAddress: config?.apiAddress ?? defaultNativeAuthConfig.apiAddress,
    tokenExpirationToastWarningSeconds:
      config?.tokenExpirationToastWarningSeconds ??
      defaultNativeAuthConfig.tokenExpirationToastWarningSeconds
  };
  return nativeAuthConfig;
};
