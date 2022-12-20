import { useDappStore } from 'erdjs-vue/store/erdjsDapp';

export const useGetAccountInfo = () => {
  return useDappStore().getAccountInfo;
};
