import { getTransactionsByHashes as defaultGetTxByHash } from 'erdjs-vue/apiCalls/transactions';
import { useTransactionsStore } from 'erdjs-vue/store/erdjsTransactions';
import type {
  GetTransactionsByHashesReturnType,
  GetTransactionsByHashesType
} from 'erdjs-vue/types';
import type {
  CustomTransactionInformation,
  SignedTransactionsBodyType
} from 'erdjs-vue/types';
import { TransactionServerStatusesEnum } from 'erdjs-vue/types/enums.types';
import {
  getIsTransactionFailed,
  getIsTransactionPending,
  getIsTransactionSuccessful
} from 'erdjs-vue/utils/transactions/transactionStateByStatus';

import { refreshAccount } from 'erdjs-vue/utils/account';
import { getPendingTransactions } from './getPendingTransactions';
import { manageFailedTransactions } from './manageFailedTransactions';
import { manageTimedOutTransactions } from './manageTimedOutTransactions';

export interface TransactionStatusTrackerPropsType {
  sessionId: string;
  transactionBatch: SignedTransactionsBodyType;
  getTransactionsByHash?: GetTransactionsByHashesType;
  shouldRefreshBalance?: boolean;
}

interface RetriesType {
  [hash: string]: number;
}

const retries: RetriesType = {};
const timeouts: string[] = [];

interface ManageTransactionType {
  serverTransaction: GetTransactionsByHashesReturnType[0];
  sessionId: string;
  customTransactionInformation?: CustomTransactionInformation;
  shouldRefreshBalance?: boolean;
}

function manageTransaction({
  serverTransaction,
  sessionId,
  customTransactionInformation,
  shouldRefreshBalance
}: ManageTransactionType) {
  const {
    hash,
    status,
    results,
    invalidTransaction,
    hasStatusChanged
  } = serverTransaction;
  try {
    if (timeouts.includes(hash)) {
      return;
    }

    const retriesForThisHash = retries[hash];
    if (retriesForThisHash > 30) {
      // consider transaction as stuck after 1 minute
      manageTimedOutTransactions(sessionId);
      return;
    }

    if (invalidTransaction || getIsTransactionPending(status)) {
      retries[hash] = retries[hash] ? retries[hash] + 1 : 1;
      return;
    }
    if (hasStatusChanged) {
      if (
        getIsTransactionSuccessful(status) &&
        customTransactionInformation?.completedTransactionsDelay != null
      ) {
        //if the transaction is successful and the success status should be updated with a delay
        //it will enter a timeout and then change the status
        timeouts.push(hash);
        setTimeout(
          () =>
            useTransactionsStore()
              .updateSignedTransactionStatus({
                sessionId,
                status: TransactionServerStatusesEnum.success,
                transactionHash: hash
              }),
          customTransactionInformation?.completedTransactionsDelay
        );
      } else {
        //otherwise, it will just trigger the change of status
        useTransactionsStore()
          .updateSignedTransactionStatus({
            sessionId,
            status,
            transactionHash: hash
          });
      }
    }

    // if set to true will trigger a balance refresh after each iteration
    if (!shouldRefreshBalance) {
      refreshAccount();
    }

    if (getIsTransactionFailed(status)) {
      manageFailedTransactions({ sessionId, hash, results });
    }
  } catch (error) {
    console.error(error);
    manageTimedOutTransactions(sessionId);
  }
}

export async function checkBatch({
  sessionId,
  transactionBatch: { transactions, customTransactionInformation },
  getTransactionsByHash = defaultGetTxByHash,
  shouldRefreshBalance
}: TransactionStatusTrackerPropsType) {
  try {
    if (transactions == null) {
      return;
    }

    const pendingTransactions = getPendingTransactions(transactions, timeouts);

    const serverTransactions = await getTransactionsByHash(pendingTransactions);

    for (const serverTransaction of serverTransactions) {
      manageTransaction({
        serverTransaction,
        sessionId,
        customTransactionInformation,
        shouldRefreshBalance
      });
    }
  } catch (error) {
    console.error(error);
  }
}
