import BigNumber from 'bignumber.js';
import type { InterpretedTransactionType } from 'erdjs-vue/types/serverTransactions.types';
import { decodeBase64 } from 'erdjs-vue/utils/decoders';
import { getEgldValueData } from './getEgldValueData';

let warningLogged = false;

export function getValueFromDataField(transaction: InterpretedTransactionType) {
  try {
    const data = decodeBase64(transaction.data);
    const encodedValue = data.replace(`${transaction.action?.name}@`, '');
    const value = new BigNumber(encodedValue, 16);
    if (!value.isNaN()) {
      return getEgldValueData(value.toString(10));
    }
  } catch (err) {
    if (!warningLogged) {
      console.error(
        `Unable to extract value for txHash: ${transaction.txHash}`
      );
      warningLogged = true;
    }
  }

  // fallback on transaction value
  return getEgldValueData(transaction.value);
}
