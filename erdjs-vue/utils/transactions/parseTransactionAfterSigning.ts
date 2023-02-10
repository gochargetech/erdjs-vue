import type { PlainSignedTransaction } from '@multiversx/sdk-web-wallet-provider/out/plainSignedTransaction';
import type { Transaction } from '@multiversx/sdk-core/out';
import { newTransaction } from 'erdjs-vue/models';
import type { SignedTransactionType } from 'erdjs-vue/types';
import { TransactionServerStatusesEnum } from 'erdjs-vue/types/enums.types';

export function parseTransactionAfterSigning(
  signedTransaction: Transaction | PlainSignedTransaction
) {
  const isComplexTransaction =
    Object.getPrototypeOf(signedTransaction).toPlainObject != null;

  const transaction = isComplexTransaction
    ? (signedTransaction as Transaction)
    : newTransaction(signedTransaction as PlainSignedTransaction);

  const parsedTransaction: SignedTransactionType = {
    ...transaction.toPlainObject(),
    hash: transaction.getHash().hex(),
    status: TransactionServerStatusesEnum.pending
  };
  return parsedTransaction;
}
