import type { Transaction } from '@multiversx/sdk-core/out';
import BigNumber from 'bignumber.js';
import { GAS_PER_DATA_BYTE, GAS_PRICE_MODIFIER } from 'erdjs-vue/constants/index';
import { calculateFeeLimit } from 'erdjs-vue/utils/operations';

export function calcTotalFee(transactions: Transaction[], minGasLimit: number) {
  let totalFee = new BigNumber(0);

  transactions.forEach((tx) => {
    const fee = calculateFeeLimit({
      gasPerDataByte: String(GAS_PER_DATA_BYTE),
      gasPriceModifier: String(GAS_PRICE_MODIFIER),
      minGasLimit: String(minGasLimit),
      gasLimit: tx
        .getGasLimit()
        .valueOf()
        .toString(),
      gasPrice: tx
        .getGasPrice()
        .valueOf()
        .toString(),
      data: tx.getData().toString(),
      chainId: tx.getChainID().valueOf()
    });
    totalFee = totalFee.plus(new BigNumber(fee));
  });

  return totalFee;
}
