import { defineStore } from 'pinia'
import {
  TransactionBatchStatusesEnum,
  TransactionServerStatusesEnum
} from 'erdjs-vue/types/enums.types';
import type {
  CustomTransactionInformation,
  SignedTransactionsBodyType,
  SignedTransactionsType,
  SignedTransactionType,
  TransactionsToSignType
} from 'erdjs-vue/types';
import {
  getIsTransactionFailed,
  getIsTransactionPending,
  getIsTransactionSuccessful,
  getIsTransactionTimedOut
} from 'erdjs-vue/utils/transactions/transactionStateByStatus';
import { newTransaction } from 'erdjs-vue/models/newTransaction';
import type { RawTransactionType } from 'erdjs-vue/types';

export interface UpdateSignedTransactionsPayloadType {
  sessionId: string;
  status: TransactionBatchStatusesEnum;
  errorMessage?: string;
  transactions?: SignedTransactionType[];
}

export interface MoveTransactionsToSignedStatePayloadType
  extends SignedTransactionsBodyType {
  sessionId: string;
}

export interface UpdateSignedTransactionStatusPayloadType {
  sessionId: string;
  transactionHash: string;
  status: TransactionServerStatusesEnum;
  errorMessage?: string;
}

export interface TransactionsSliceStateType {
  signedTransactions: SignedTransactionsType;
  transactionsToSign: TransactionsToSignType | null;
  signTransactionsError: string | null;
  signTransactionsCancelMessage: string | null;
  customTransactionInformationForSessionId: {
    [sessionId: string]: CustomTransactionInformation;
  };
}

const initialState: TransactionsSliceStateType = {
  signedTransactions: {},
  transactionsToSign: null,
  signTransactionsError: null,
  signTransactionsCancelMessage: null,
  customTransactionInformationForSessionId: {}
};

const defaultCustomInformation: CustomTransactionInformation = {
  signWithoutSending: false,
  sessionInformation: null,
  redirectAfterSign: false
};

const selectTxByStatus = (txStatusVerifier: typeof getIsTransactionPending, signedTransactions: SignedTransactionsType) =>
  Object.entries(signedTransactions).reduce((acc, [sessionId, txBody]) => {
    if (txStatusVerifier(txBody.status)) {
      acc[sessionId] = txBody;
    }
    return acc as SignedTransactionsType;
  }, {} as SignedTransactionsType);


export const useTransactionsStore = defineStore('erdjs-transactions', {
  state: () => {
    return { ...initialState }
  },
  persist: false,
  getters: {
    getTransactionsToSign: (state) => {
      if (state?.transactionsToSign == null) {
        return null;
      }
      return {
        ...state.transactionsToSign,
        transactions:
          state?.transactionsToSign?.transactions.map((tx: RawTransactionType) =>
            newTransaction(tx)
          ) || []
      };
    },
    getSignedTransactions: (state) => {
      return state.signedTransactions;
    },
    getPendingSignedTransactions: (state) => {
      return selectTxByStatus(getIsTransactionPending, state?.signedTransactions);
    },
    getFailedTransactions: (state) => {
      return selectTxByStatus(getIsTransactionFailed, state.signedTransactions);
    },
    getSuccessfulTransactions: (state) => {
      return selectTxByStatus(getIsTransactionSuccessful, state.signedTransactions);
    },
    getTimedOutTransactions: (state) => {
      return selectTxByStatus(getIsTransactionTimedOut, state.signedTransactions);
    },
    getSignTransactionsError: (state) => {
      return state.signTransactionsError;
    },
    getSignTransactionsCancelMessage: (state) => {
      return state.signTransactionsCancelMessage;
    },
    getTransaction: (state) => {
      return (transactionSessionId: string | null) => {
        return transactionSessionId != null
          ? state.signedTransactions?.[transactionSessionId] || {}
          : {}
      }
    },
    getTransactionStatus: (state) => {
      return (transactionSessionId: string | null) => {
        return transactionSessionId != null && state.signedTransactions?.[transactionSessionId]
          ? state.signedTransactions?.[transactionSessionId].status || {}
          : {}
      }
    },
  },
  actions: {
    moveTransactionsToSignedState(payload: MoveTransactionsToSignedStatePayloadType) {
      const {
        sessionId,
        transactions,
        errorMessage,
        status,
        redirectRoute
      } = payload;
      const customTransactionInformation =
        this.customTransactionInformationForSessionId?.[sessionId] ||
        defaultCustomInformation;
      this.signedTransactions[sessionId] = {
        transactions,
        status,
        errorMessage,
        redirectRoute,
        customTransactionInformation
      };
      if (this?.transactionsToSign?.sessionId === sessionId) {
        this.transactionsToSign = initialState.transactionsToSign;
      }
    },
    clearSignedTransaction(payload: string) {
      delete this.signedTransactions[payload];
    },
    clearTransactionToSign() {
      if (this?.transactionsToSign) {
        this.transactionsToSign = null;
      }
    },
    updateSignedTransaction(payload: UpdateSignedTransactionsPayloadType) {
      const { sessionId, status, errorMessage, transactions } = payload;
      const transaction = this.signedTransactions[sessionId];
      if (transaction != null) {
        this.signedTransactions[sessionId].status = status;
        if (errorMessage != null) {
          this.signedTransactions[sessionId].errorMessage = errorMessage;
        }
        if (transactions != null) {
          this.signedTransactions[sessionId].transactions = transactions;
        }
      }
    },
    updateSignedTransactions(payload: UpdateSignedTransactionsPayloadType) {
      const { sessionId, status, errorMessage, transactions } = payload;
      const transaction = this.signedTransactions[sessionId];
      if (transaction != null) {
        this.signedTransactions[sessionId].status = status;
        if (errorMessage != null) {
          this.signedTransactions[sessionId].errorMessage = errorMessage;
        }
        if (transactions != null) {
          this.signedTransactions[sessionId].transactions = transactions;
        }
      }
    },
    updateSignedTransactionStatus(payload: UpdateSignedTransactionStatusPayloadType) {
      const {
        sessionId,
        status,
        errorMessage,
        transactionHash
      } = payload;
      const transactions = this.signedTransactions?.[sessionId]?.transactions;
      if (transactions != null) {
        this.signedTransactions[sessionId].transactions = transactions.map(
          (transaction) => {
            if (transaction.hash === transactionHash) {
              return {
                ...transaction,
                status,
                errorMessage
              };
            }
            return transaction;
          }
        );
        const areTransactionsSuccessful = this.signedTransactions[
          sessionId
        ]?.transactions?.every((transaction) => {
          return getIsTransactionSuccessful(transaction.status);
        });

        const areTransactionsFailed = this.signedTransactions[
          sessionId
        ]?.transactions?.every((transaction) =>
          getIsTransactionFailed(transaction.status)
        );
        if (areTransactionsSuccessful) {
          this.signedTransactions[sessionId].status =
            TransactionBatchStatusesEnum.success;
        }
        if (areTransactionsFailed) {
          this.signedTransactions[sessionId].status =
            TransactionBatchStatusesEnum.fail;
        }
      }
    },
    setTransactionsToSign(payload: TransactionsToSignType) {
      this.transactionsToSign = payload;

      const { sessionId, customTransactionInformation } = payload;
      this.customTransactionInformationForSessionId[
        sessionId
      ] = customTransactionInformation;

      this.signTransactionsError = null;
    },
    clearAllTransactionsToSign() {
      this.transactionsToSign = initialState.transactionsToSign;
      this.signTransactionsError = null;
    },
    clearAllSignedTransactions() {
      this.transactionsToSign = initialState.transactionsToSign;
      this.signTransactionsError = null;
    },
    setSignTransactionsError(payload: string | null) {
      this.signTransactionsError = payload;
    },
    setSignTransactionsCancelMessage(payload: string | null) {
      this.signTransactionsCancelMessage = payload;
    },
  },
})