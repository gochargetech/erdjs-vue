import {
  Address,
  Transaction,
  TransactionOptions,
  TransactionPayload,
  TransactionVersion
} from '@elrondnetwork/erdjs';
import { GAS_LIMIT, GAS_PRICE, VERSION } from 'erdjs-vue/constants/index';
import type { RawTransactionType } from 'erdjs-vue/types';
import { isStringBase64 } from 'erdjs-vue/utils/decoders/base64Utils';

export function newTransaction(rawTransaction: RawTransactionType) {
  const { data } = rawTransaction;
  const dataPayload = isStringBase64(data ?? '')
    ? TransactionPayload.fromEncoded(data)
    : new TransactionPayload(data);

  const transaction = new Transaction({
    value: rawTransaction.value.valueOf(),
    data: dataPayload,
    nonce: rawTransaction.nonce.valueOf(),
    receiver: new Address(rawTransaction.receiver),
    sender: new Address(rawTransaction.sender),
    gasLimit: rawTransaction.gasLimit.valueOf() ?? GAS_LIMIT,
    gasPrice: rawTransaction.gasPrice.valueOf() ?? GAS_PRICE,
    chainID: rawTransaction.chainID.valueOf(),
    version: new TransactionVersion(rawTransaction.version ?? VERSION),
    ...(rawTransaction.options
      ? { options: new TransactionOptions(rawTransaction.options) }
      : {})
  });

  transaction.applySignature(
    {
      hex: () => rawTransaction.signature || ''
    },
    new Address(rawTransaction.sender)
  );

  return transaction;
}
