import { ExtensionProvider } from '@elrondnetwork/erdjs-extension-provider';

import { useGetAccountProvider } from 'erdjs-vue/hooks/account/useGetAccountProvider';
import { useParseSignedTransactions } from 'erdjs-vue/hooks/transactions/useParseSignedTransactions';

import { useTransactionsStore } from 'erdjs-vue/store/erdjsTransactions';
import { useTransactionsInfoStore } from 'erdjs-vue/store/erdjsTransactionsInfo';

export const useSignTransactionsCommonData = () => {
  const { provider } = useGetAccountProvider();
  let error: string | null = null;

  const setError = (err: string) => {
    error = err;
  }

  const transactionsToSign = useTransactionsStore().getTransactionsToSign;
  const signTransactionsCancelMessage = useTransactionsStore().getSignTransactionsCancelMessage;

  const hasTransactions = Boolean(transactionsToSign?.transactions);

  const clearTransactionStatusMessage = () => {
    error = null;
    useTransactionsStore().setSignTransactionsCancelMessage(null);
  };

  const onAbort = (sessionId?: string) => {
    clearTransactionStatusMessage();
    clearSignInfo(sessionId);
  };

  useParseSignedTransactions(onAbort);

  function clearSignInfo(sessionId?: string) {
    const isExtensionProvider = provider instanceof ExtensionProvider;

    useTransactionsStore().clearAllTransactionsToSign();
    useTransactionsInfoStore().clearTransactionsInfoForSessionId(sessionId);

    if (!isExtensionProvider) {
      return;
    }

    clearTransactionStatusMessage();
    ExtensionProvider.getInstance()?.cancelAction?.();
  }

  return {
    error,
    canceledTransactionsMessage: signTransactionsCancelMessage,
    clearTransactionStatusMessage,
    onAbort,
    setError,
    hasTransactions,
    transactionsToSign
  };
};
