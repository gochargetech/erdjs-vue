import { useTransactionsStore } from 'erdjs-vue/store/erdjsTransactions';
import type { SignedTransactionsType, SignedTransactionsBodyType } from 'erdjs-vue/types';

export interface useGetSignedTransactionsReturnType {
  signedTransactions: SignedTransactionsType;
  signedTransactionsArray: [string, SignedTransactionsBodyType][];
  hasSignedTransactions: boolean;
}

export function useGetSignedTransactions(): useGetSignedTransactionsReturnType {
  const signedTransactions = useTransactionsStore().signedTransactions;
  const signedTransactionsArray: [
    string,
    SignedTransactionsBodyType
  ][] = Object.entries(signedTransactions);
  const hasSignedTransactions = signedTransactionsArray?.length > 0;
  return {
    signedTransactions,
    signedTransactionsArray,
    hasSignedTransactions
  };
}
