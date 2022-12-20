import { ref, watch } from "vue";
import { useGetSignedTransactions } from 'erdjs-vue/hooks/transactions/useGetSignedTransactions';
import { useTransactionsStore } from 'erdjs-vue/store/erdjsTransactions';
import {
  removeAllSignedTransactions,
  removeAllTransactionsToSign
} from 'erdjs-vue/services';
import {
  LoginMethodsEnum,
  TransactionBatchStatusesEnum
} from 'erdjs-vue/types/enums.types';
import {
  getIsTransactionFailed,
  getIsTransactionPending,
  getIsTransactionSuccessful,
  getIsTransactionTimedOut
} from 'erdjs-vue/utils/transactions/transactionStateByStatus';
import { getIsProviderEqualTo } from 'erdjs-vue/utils/account/getIsProviderEqualTo';

export interface UseTrackTransactionStatusArgsType {
  transactionId: string | null;
  onSuccess?: (transactionId: string | null) => void;
  onFail?: (transactionId: string | null, errorMessage?: string) => void;
  onTimedOut?: (transactionId: string | null) => void;
  onCancelled?: (transactionId: string | null) => void;
}

export function useTrackTransactionStatus({
  transactionId: txId,
  onSuccess,
  onFail,
  onCancelled,
  onTimedOut
}: UseTrackTransactionStatusArgsType) {
  const { signedTransactionsArray } = useGetSignedTransactions();
  const isWalletProvider = getIsProviderEqualTo(LoginMethodsEnum.wallet);

  const [lastSessionId] =
    signedTransactionsArray.length > 0
      ? signedTransactionsArray[signedTransactionsArray.length - 1]
      : [];

  /**
   * Web wallet restores sessionId, which is lost when redirecting,
   * so we extract it from signedTransactions
   */
  const walletSessionId = txId ?? lastSessionId ?? null;

  const transactionId = isWalletProvider ? walletSessionId : txId;

  const transactionsBatch = useTransactionsStore().getTransaction(transactionId);

  const { status, transactions, errorMessage } = transactionsBatch;

  const isPending = getIsTransactionPending(status);
  const isFailed = getIsTransactionFailed(status);
  const isTimedOut = getIsTransactionTimedOut(status);
  const isSuccessful = getIsTransactionSuccessful(status);

  const isCancelled = status === TransactionBatchStatusesEnum.cancelled;

  /**
   * Because wallet restores the session upon return,
   * we make sure to execute the callback actions
   * once, and then clear all transactions from store to
   * prevent re-execution
   */
  function preventWalletDoubleCallback() {
    if (isWalletProvider) {
      removeAllSignedTransactions();
      removeAllTransactionsToSign();
    }
  }

  const isSuccessfulRef = ref(isSuccessful);
  watch(isSuccessfulRef, () => {
    if (isSuccessful && onSuccess) {
      onSuccess(transactionId);
    }
  }, {
    immediate: true
  });

  const isFailedRef = ref(isFailed);
  watch(isFailedRef, () => {
    if (isFailed && onFail) {
      onFail(transactionId, errorMessage);
      preventWalletDoubleCallback();
    }
  }, {
    immediate: true
  });

  const isCancelledRef = ref(isCancelled);
  watch(isCancelledRef, () => {
    if (isCancelled && onCancelled) {
      onCancelled(transactionId);
      preventWalletDoubleCallback();
    }
  }, {
    immediate: true
  });

  const isTimedOutRef = ref(isTimedOut);
  watch(isTimedOutRef, () => {
    if (isTimedOut) {
      if (onTimedOut) {
        onTimedOut(transactionId);
      } else {
        onFail?.(transactionId, 'timeout');
      }
    }
  }, {
    immediate: true
  });

  if (transactionId == null) {
    return {};
  }

  if (transactionsBatch == null) {
    return { errorMessage: 'No transaction to track' };
  }

  return {
    isPending,
    isSuccessful,
    isFailed,
    isCancelled,
    errorMessage,
    status,
    transactions
  };
}
