import BigNumber from 'bignumber.js';
import { DECIMALS, DIGITS, REFUNDED_GAS } from 'erdjs-vue/constants/index';
import type { ServerTransactionType } from 'erdjs-vue/types/serverTransactions.types';
import { formatAmount } from 'erdjs-vue/utils/operations/formatAmount';

const getReceiptValue = (transaction: ServerTransactionType) => {
  if (!transaction.receipt?.value) {
    return '';
  }

  if (transaction.receipt?.data === REFUNDED_GAS) {
    const formattedGas = formatAmount({
      input: transaction.receipt.value,
      decimals: DECIMALS,
      digits: DIGITS,
      showLastNonZeroDecimal: true
    });
    const gasRefunded = new BigNumber(formattedGas)
      .times(transaction.gasPrice)
      .times(100);

    return gasRefunded.toFixed();
  }

  return transaction.receipt.value;
};

export function getReceiptMessage(transaction: ServerTransactionType) {
  const message = transaction.receipt?.data;

  if (!message) {
    return '';
  }

  const receiptValue = getReceiptValue(transaction);
  const value = receiptValue ? `: ${receiptValue}` : '';

  return `${message}${value}`;
}
