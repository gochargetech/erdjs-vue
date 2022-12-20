import { useDappStore } from 'erdjs-vue/store/erdjsDapp';

export const getCleanApiAddress = (customApiAddress?: string) => {
  const apiAddress = customApiAddress ?? useDappStore().getApiAddress;
  return apiAddress.endsWith('/') ? apiAddress.slice(0, -1) : apiAddress;
};
