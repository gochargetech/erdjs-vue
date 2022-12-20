import { getAccountProvider, getProviderType } from 'erdjs-vue/providers';

export function getAccountProviderType() {
  const provider = getAccountProvider();
  return getProviderType(provider);
}
