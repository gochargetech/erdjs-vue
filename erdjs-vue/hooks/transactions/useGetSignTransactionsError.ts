import { useTransactionsStore } from 'erdjs-vue/store/erdjsTransactions';

export const useGetSignTransactionsError = () => {
  return useTransactionsStore().getSignTransactionsError;
};
