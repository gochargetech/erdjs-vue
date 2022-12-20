import { useTransactionsStore } from 'erdjs-vue/store/erdjsTransactions';
import type { SignedTransactionsType, SignedTransactionsBodyType } from 'erdjs-vue/types';

export interface useGetFailedTransactionsReturnType {
  failedTransactions: SignedTransactionsType;
  failedTransactionsArray: [string, SignedTransactionsBodyType][];
  hasFailedTransactions: boolean;
}

//this is a hook to be able to take advantage of memoization offered by useSelector
export function useGetFailedTransactions(): useGetFailedTransactionsReturnType {
  const failedTransactions = useTransactionsStore().getFailedTransactions;
  const failedTransactionsArray: [
    string,
    SignedTransactionsBodyType
  ][] = Object.entries(failedTransactions);
  const hasFailedTransactions = failedTransactionsArray?.length > 0;

  return {
    failedTransactions,
    failedTransactionsArray,
    hasFailedTransactions
  };
}
