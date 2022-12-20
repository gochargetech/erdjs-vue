import { useAccountStore } from 'erdjs-vue/store/erdjsAccountInfo';

export const useGetAccount = () => {
  return useAccountStore().getAccount;
};
