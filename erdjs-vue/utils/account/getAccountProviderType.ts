import { getAccountProvider, getProviderType } from 'erdjs-vue/providers';
// import { useNetworkProviderStore } from 'erdjs-vue/store/erdjsProvider'

export function getAccountProviderType() {
  const provider = getAccountProvider();
  // const provider = useNetworkProviderStore().getCurrent;
  return getProviderType(provider);
}
