import { useGetPendingTransactions } from 'erdjs-vue/hooks/transactions/useGetPendingTransactions';
import type { GetTransactionsByHashesType } from 'erdjs-vue/types/transactions.types';
import { refreshAccount } from 'erdjs-vue/utils/account/refreshAccount';
import { getIsTransactionPending } from 'erdjs-vue/utils/transactions/transactionStateByStatus';
import { checkBatch } from './checkBatch';

export function useCheckTransactionStatus() {
  async function checkTransactionStatus(props: {
    getTransactionsByHash?: GetTransactionsByHashesType;
    shouldRefreshBalance?: boolean;
  }) {
    const { pendingTransactionsArray } = useGetPendingTransactions();
    const pendingBatches = pendingTransactionsArray.filter(
      ([sessionId, transactionBatch]) => {
        const isPending =
          sessionId != null && getIsTransactionPending(transactionBatch.status);
        return isPending;
      }
    );

    if (pendingBatches.length > 0) {
      for (const [sessionId, transactionBatch] of pendingBatches) {
        await checkBatch({
          sessionId,
          transactionBatch,
          ...props
        });
      }
    }
    if (props.shouldRefreshBalance) {
      refreshAccount();
    }
  }

  return checkTransactionStatus;
}
