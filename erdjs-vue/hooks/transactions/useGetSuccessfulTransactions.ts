import { useTransactionsStore } from 'erdjs-vue/store/erdjsTransactions';
import type { SignedTransactionsType, SignedTransactionsBodyType } from 'erdjs-vue/types';

export interface useGetSuccessfulTransactionsReturnType {
  successfulTransactions: SignedTransactionsType;
  successfulTransactionsArray: [string, SignedTransactionsBodyType][];
  hasSuccessfulTransactions: boolean;
}

//this is a hook to be able to take advantage of memoization offered by useSelector
export function useGetSuccessfulTransactions(): useGetSuccessfulTransactionsReturnType {
  const successfulTransactions = useTransactionsStore().getSuccessfulTransactions;
  const successfulTransactionsArray: [
    string,
    SignedTransactionsBodyType
  ][] = Object.entries(successfulTransactions);
  const hasSuccessfulTransactions = successfulTransactionsArray?.length > 0;
  return {
    successfulTransactions,
    successfulTransactionsArray,
    hasSuccessfulTransactions
  };
}
