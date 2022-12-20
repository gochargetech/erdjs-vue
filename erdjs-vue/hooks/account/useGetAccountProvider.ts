import { getAccountProvider, getProviderType } from 'erdjs-vue/providers';

export const useGetAccountProvider = () => {
  const provider = getAccountProvider();

  const providerType = getProviderType(provider);
  return { provider, providerType };
};
