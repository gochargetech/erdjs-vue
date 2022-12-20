import type { Transaction } from '@elrondnetwork/erdjs';
import { useTransactionsStore } from 'erdjs-vue/store/erdjsTransactions';

/**
 * If user cancels signing in SignTransactionsModal, and transactionsToSign were cleared from store make sure we access the latest store information before proceeeding
 */
export function getShouldMoveTransactionsToSignedState(
  signedTransactions: Transaction[]
) {
  const currentTransactions = useTransactionsStore().getTransactionsToSign;

  const hasSameTransactions =
    Object.keys(signedTransactions).length ===
    currentTransactions?.transactions.length;

  const hasAllTransactionsSigned = signedTransactions && hasSameTransactions;
  return signedTransactions && hasAllTransactionsSigned;
}
