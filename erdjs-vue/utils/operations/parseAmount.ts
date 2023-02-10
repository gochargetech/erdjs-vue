import { TokenPayment } from '@multiversx/sdk-core';
import { DECIMALS } from 'erdjs-vue/constants/index';

export function parseAmount(amount: string, numDecimals: number = DECIMALS) {
  return TokenPayment.fungibleFromAmount('', amount, numDecimals).toString();
}
