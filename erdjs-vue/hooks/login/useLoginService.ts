import { Address, SignableMessage } from '@multiversx/sdk-core';
import { useDappStore } from 'erdjs-vue/store/erdjsDapp';
import { useLoginInfoStore } from 'erdjs-vue/store/erdjsLoginInfo';
import { useAccountStore } from 'erdjs-vue/store/erdjsAccountInfo';
import { ref } from 'vue';

import { nativeAuth } from 'erdjs-vue/services/nativeAuth';
import { getNativeAuthConfig } from 'erdjs-vue/services/nativeAuth/methods';
import type { OnProviderLoginType } from 'erdjs-vue/types/login.types';

const getApiAddress = (
  apiAddress: string,
  config?: OnProviderLoginType['nativeAuth']
) => {
  if (!config) {
    return null;
  }
  if (config === true) {
    return apiAddress;
  }
  return config.apiAddress ?? apiAddress;
};

export const useLoginService = (config?: OnProviderLoginType['nativeAuth']) => {
  const network = useDappStore().getNetworkConfig;
  const tokenLogin = useLoginInfoStore().getTokenLogin;
  const tokenRef = ref(tokenLogin?.loginToken);

  const apiAddress = getApiAddress(network.apiAddress, config);

  const configuration = getNativeAuthConfig({
    ...(config === true ? {} : config),
    ...(apiAddress ? { apiAddress } : {})
  });

  const hasNativeAuth = Boolean(config);

  const client = nativeAuth(configuration);
  const { address } = useAccountStore().getAccount;

  const setLoginToken = (loginToken: string) => {
    tokenRef.value = loginToken;
    useLoginInfoStore().setTokenLogin({
      loginToken,
      ...(apiAddress ? { nativeAuthConfig: configuration } : {})
    });
  };

  const getNativeAuthLoginToken = async () => {
    try {
      const loginToken = await client.initialize();
      return loginToken;
    } catch (error) {
      console.error('Unable to get block. Login failed.', error);
      return;
    }
  };

  const setTokenLoginInfo = ({
    address,
    signature
  }: {
    address: string;
    signature: string;
  }) => {
    const loginToken = tokenRef.value;

    if (!loginToken) {
      throw 'Token not found. Call `setLoginToken` first.';
    }

    if (!hasNativeAuth) {
      useLoginInfoStore().setTokenLogin({
        loginToken,
        signature
      });
      return;
    }

    const nativeAuthToken = client.getToken({
      address,
      token: loginToken,
      signature
    });

    useLoginInfoStore().setTokenLogin({
      loginToken: loginToken,
      signature,
      // @ts-ignore
      nativeAuthToken,
      ...(apiAddress ? { nativeAuthConfig: configuration } : {})
    });
  };

  const refreshNativeAuthTokenLogin = async ({
    signMessageCallback
  }: {
    signMessageCallback: (
      messageToSign: SignableMessage,
      options: Record<any, any>
    ) => Promise<SignableMessage>;
  }) => {
    const loginToken = await getNativeAuthLoginToken();
    tokenRef.value = loginToken;
    if (!loginToken) {
      return;
    }
    const messageToSign = new SignableMessage({
      address: new Address(address),
      message: Buffer.from(loginToken)
    });
    const signature = await signMessageCallback(messageToSign, {});
    setTokenLoginInfo({
      address,
      signature: (signature.toJSON() as any).signature
    });
  };

  return {
    configuration,
    setLoginToken,
    getNativeAuthLoginToken,
    setTokenLoginInfo,
    refreshNativeAuthTokenLogin
  };
};
