import { useTransactionsStore } from 'erdjs-vue/store/erdjsTransactions';
import type { SmartContractResult } from 'erdjs-vue/types';
import {
  TransactionBatchStatusesEnum,
  TransactionServerStatusesEnum
} from 'erdjs-vue/types/enums.types';

export function manageFailedTransactions({
  results,
  hash,
  sessionId
}: {
  results: SmartContractResult[];
  hash: string;
  sessionId: string;
}) {
  const resultWithError = results?.find(
    (scResult) => scResult?.returnMessage !== ''
  );

  useTransactionsStore()
    .updateSignedTransactionStatus({
      transactionHash: hash,
      sessionId,
      status: TransactionServerStatusesEnum.fail,
      errorMessage: resultWithError?.returnMessage
    });
  useTransactionsStore()
    .updateSignedTransactions({
      sessionId,
      status: TransactionBatchStatusesEnum.fail,
      errorMessage: resultWithError?.returnMessage
    });
}
