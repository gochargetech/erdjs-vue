import { watchEffect } from 'vue';
import { getTransactionsByHashes as defaultGetTxByHash } from 'erdjs-vue/apiCalls/transactions';
import { useCheckTransactionStatus } from 'erdjs-vue/hooks/transactions';
import { useRegisterWebsocketListener } from 'erdjs-vue/hooks/websocketListener';
import type { GetTransactionsByHashesType } from 'erdjs-vue/types/transactions.types';

export interface TransactionsTrackerType {
  getTransactionsByHash?: GetTransactionsByHashesType;
}

export function useTransactionsTracker(props?: TransactionsTrackerType) {
  const checkTransactionStatus = useCheckTransactionStatus();

  const getTransactionsByHash =
    props?.getTransactionsByHash ?? defaultGetTxByHash;

  const onMessage = () => {
    checkTransactionStatus({
      shouldRefreshBalance: true,
      getTransactionsByHash
    });
  };

  useRegisterWebsocketListener(onMessage);

  watchEffect(() => {
    const interval = setInterval(onMessage, 6000);
    return () => {
      clearInterval(interval);
    };
  });
}
