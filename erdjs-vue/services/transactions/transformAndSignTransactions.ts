import { Address, Transaction } from '@elrondnetwork/erdjs';
import BigNumber from 'bignumber.js';

import { GAS_LIMIT, GAS_PER_DATA_BYTE, GAS_PRICE } from 'erdjs-vue/constants/index';
import { newTransaction } from 'erdjs-vue/models/newTransaction';
import type { SendSimpleTransactionPropsType } from 'erdjs-vue/types';
import { getAccount } from 'erdjs-vue/utils/account/getAccount';
import { getLatestNonce } from 'erdjs-vue/utils/account/getLatestNonce';

import { useAccountStore } from 'erdjs-vue/store/erdjsAccountInfo';
import { useDappStore } from 'erdjs-vue/store/erdjsDapp';

enum ErrorCodesEnum {
  'invalidReceiver' = 'Invalid Receiver address',
  'unknownError' = 'Unknown Error. Please check the transactions and try again'
}

// TODO: replace with new erdjs function
export function calculateGasLimit(data?: string) {
  const bNconfigGasLimit = new BigNumber(GAS_LIMIT);
  const bNgasPerDataByte = new BigNumber(GAS_PER_DATA_BYTE);
  const bNgasValue = data
    ? bNgasPerDataByte.times(Buffer.from(data).length)
    : 0;
  const bNgasLimit = bNconfigGasLimit.plus(bNgasValue);
  const gasLimit = bNgasLimit.toString(10);
  return gasLimit;
}

export async function transformAndSignTransactions({
  transactions
}: SendSimpleTransactionPropsType): Promise<Transaction[]> {
  const address = useAccountStore().getAddress;
  const account = await getAccount(address);
  const nonce = getLatestNonce(account);

  return transactions.map((tx) => {
    const {
      value,
      receiver,
      data = '',
      chainID,
      version = 1,
      options,
      gasPrice = GAS_PRICE,
      gasLimit = calculateGasLimit(tx.data)
    } = tx;
    let validatedReceiver = receiver;

    try {
      const addr = new Address(receiver);
      validatedReceiver = addr.hex();
    } catch (err) {
      throw ErrorCodesEnum.invalidReceiver;
    }

    const storeChainId = useDappStore().getChainId
      .valueOf()
      .toString();
    const transactionsChainId = chainID || storeChainId;

    return newTransaction({
      value,
      receiver: validatedReceiver,
      data,
      gasPrice,
      gasLimit: Number(gasLimit),
      nonce: Number(nonce.valueOf().toString()),
      sender: new Address(address).hex(),
      chainID: transactionsChainId,
      version: version,
      options
    });
  });
}
