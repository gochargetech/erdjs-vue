import { TRANSACTION_CANCELLED } from 'erdjs-vue/constants/errorsMessages';
import { useTransactionsStore } from 'erdjs-vue/store/erdjsTransactions';
import { useTransactionsInfoStore } from 'erdjs-vue/store/erdjsTransactionsInfo';

export function useClearTransactionsToSignWithWarning() {
  return (sessionId?: string) => {
    useTransactionsStore().clearAllTransactionsToSign();
    useTransactionsInfoStore().clearTransactionsInfoForSessionId(sessionId);
    useTransactionsStore().setSignTransactionsCancelMessage(TRANSACTION_CANCELLED);
  };
}
