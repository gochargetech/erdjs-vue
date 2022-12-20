import { useTransactionsInfoStore } from 'erdjs-vue/store/erdjsTransactionsInfo';

export function useGetTransactionDisplayInfo(toastId: string | null) {
  return useTransactionsInfoStore().getTransactionDisplayInfo(toastId);
}
