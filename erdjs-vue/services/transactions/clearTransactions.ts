import {
  useTransactionsStore
} from 'erdjs-vue/store/erdjsTransactions';

export function removeTransactionsToSign(sessionId: string) {
  useTransactionsStore().clearSignedTransaction(sessionId);
}
export function removeSignedTransaction(sessionId: string) {
  useTransactionsStore().clearSignedTransaction(sessionId);
}

export function removeAllSignedTransactions() {
  useTransactionsStore().clearAllSignedTransactions();
}

export function removeAllTransactionsToSign() {
  useTransactionsStore().clearAllTransactionsToSign();
}
