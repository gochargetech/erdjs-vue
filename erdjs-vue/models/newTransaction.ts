import {
  Address,
  Transaction,
  TransactionOptions,
  TransactionVersion
} from '@multiversx/sdk-core';
import { GAS_LIMIT, GAS_PRICE, VERSION } from 'erdjs-vue/constants/index';
import type { RawTransactionType } from 'erdjs-vue/types';
import { getDataPayloadForTransaction } from 'erdjs-vue/utils/transactions/getDataPayloadForTransaction';

export function newTransaction(rawTransaction: RawTransactionType) {
  const transaction = new Transaction({
    value: rawTransaction.value.valueOf(),
    data: getDataPayloadForTransaction(rawTransaction.data),
    nonce: rawTransaction.nonce.valueOf(),
    receiver: new Address(rawTransaction.receiver),
    ...(rawTransaction.receiverUsername
      ? { receiverUsername: rawTransaction.receiverUsername }
      : {}),
    sender: new Address(rawTransaction.sender),
    ...(rawTransaction.senderUsername
      ? { senderUsername: rawTransaction.senderUsername }
      : {}),
    gasLimit: rawTransaction.gasLimit.valueOf() ?? GAS_LIMIT,
    gasPrice: rawTransaction.gasPrice.valueOf() ?? GAS_PRICE,
    chainID: rawTransaction.chainID.valueOf(),
    version: new TransactionVersion(rawTransaction.version ?? VERSION),
    ...(rawTransaction.options
      ? { options: new TransactionOptions(rawTransaction.options) }
      : {}),
    ...(rawTransaction.guardian
      ? { guardian: new Address(rawTransaction.guardian) }
      : {})
  });

  if (rawTransaction.guardianSignature) {
    transaction.applyGuardianSignature(
      Buffer.from(rawTransaction.guardianSignature, 'hex')
    );
  }

  if (rawTransaction.signature) {
    transaction.applySignature(Buffer.from(rawTransaction.signature, 'hex'));
  }

  return transaction;
}
