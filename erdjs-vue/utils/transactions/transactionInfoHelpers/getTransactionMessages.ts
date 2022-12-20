import type { InterpretedTransactionType } from 'erdjs-vue/types';
import { getOperationsMessages } from '../getInterpretedTransaction/helpers/getOperationsMessages';
import { getReceiptMessage } from '../getInterpretedTransaction/helpers/getReceiptMessage';
import getScResultsMessages from '../getInterpretedTransaction/helpers/getScResultsMessages';

export function getTransactionMessages(
  transaction: InterpretedTransactionType
) {
  const transactionMessages = Array.from(
    new Set([
      ...getScResultsMessages(transaction),
      ...getOperationsMessages(transaction),
      getReceiptMessage(transaction)
    ])
  ).filter((el) => Boolean(el));
  return transactionMessages;
}
