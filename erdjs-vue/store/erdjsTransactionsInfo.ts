import { defineStore } from 'pinia'
import type { TransactionsDisplayInfoType } from 'erdjs-vue/types';

export interface StateType {
  [sessionId: string]: TransactionsDisplayInfoType;
}

export interface SetTransactionsInfoPayloadType {
  sessionId: string;
  transactionsDisplayInfo: TransactionsDisplayInfoType;
}

export const defaultTransactionErrorMessage = 'Transaction failed';
export const defaultTransactionSuccessMessage = 'Transaction successful';
export const defaultTransactionProcessingMessage = 'Processing transaction';
export const defaultTransactionSubmittedMessage = 'Transaction submitted';

const defaultTransactionInfo: TransactionsDisplayInfoType = {
  errorMessage: defaultTransactionErrorMessage,
  successMessage: defaultTransactionSuccessMessage,
  processingMessage: defaultTransactionProcessingMessage
};

const initialState: StateType = {
  0: defaultTransactionInfo
};

export const useTransactionsInfoStore = defineStore('erdjs-transactions-info', {
  state: () => {
    return { ...initialState }
  },
  persist: false,
  getters: {
    getTransactionDisplayInfo: (state) => {
      return (transactionSessionId: string | null) => {
        return transactionSessionId != null
          ? state?.[transactionSessionId] || defaultTransactionInfo
          : defaultTransactionInfo
      }
    },
  },
  actions: {
    setTransactionsDisplayInfo(payload: SetTransactionsInfoPayloadType) {
      const { sessionId, transactionsDisplayInfo } = payload;
      if (sessionId != null) {
        this[sessionId] = {
          errorMessage:
            transactionsDisplayInfo?.errorMessage ||
            defaultTransactionErrorMessage,
          successMessage:
            transactionsDisplayInfo?.successMessage ||
            defaultTransactionSuccessMessage,
          processingMessage:
            transactionsDisplayInfo?.processingMessage ||
            defaultTransactionProcessingMessage,
          submittedMessage:
            transactionsDisplayInfo?.submittedMessage ||
            defaultTransactionSubmittedMessage,
          transactionDuration: transactionsDisplayInfo?.transactionDuration
        };
      }
    },
    clearTransactionsInfoForSessionId(payload: string | undefined) {
      if (payload != null) {
        delete this[payload];
      }
    },
    clearTransactionsInfo() {
      this.$reset();
    }
  },
})