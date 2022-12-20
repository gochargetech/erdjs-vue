import { useDappStore } from 'erdjs-vue/store/erdjsDapp';

export const useGetNetworkConfig = () => {
  return useDappStore().getNetworkConfig;
};
