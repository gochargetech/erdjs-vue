import type { ServerTransactionType } from 'erdjs-vue/types/serverTransactions.types';

export function getTransactionReceiver(transaction: ServerTransactionType) {
  let receiver = transaction.receiver;
  if (transaction.action?.arguments?.receiver) {
    receiver = transaction.action.arguments.receiver;
  }

  return receiver;
}
