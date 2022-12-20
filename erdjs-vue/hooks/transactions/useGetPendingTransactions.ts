import { useTransactionsStore } from 'erdjs-vue/store/erdjsTransactions';
import type { SignedTransactionsType, SignedTransactionsBodyType } from 'erdjs-vue/types';

export interface UseGetPendingTransactionsReturnType {
  pendingTransactions: SignedTransactionsType;
  pendingTransactionsArray: [string, SignedTransactionsBodyType][];
  hasPendingTransactions: boolean;
}

export function useGetPendingTransactions(): UseGetPendingTransactionsReturnType {
  const pendingTransactions = useTransactionsStore().getPendingSignedTransactions;

  const pendingTransactionsArray: [
    string,
    SignedTransactionsBodyType
  ][] = Object.entries(pendingTransactions);
  const hasPendingTransactions = pendingTransactionsArray?.length > 0;
  return {
    pendingTransactions,
    pendingTransactionsArray,
    hasPendingTransactions
  };
}
