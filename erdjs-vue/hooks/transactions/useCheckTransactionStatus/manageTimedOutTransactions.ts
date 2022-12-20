import { useTransactionsStore } from 'erdjs-vue/store/erdjsTransactions';
import { TransactionBatchStatusesEnum } from 'erdjs-vue/types';

export function manageTimedOutTransactions(sessionId: string) {
  useTransactionsStore()
    .updateSignedTransactions({
      sessionId,
      status: TransactionBatchStatusesEnum.timedOut
    });
}
