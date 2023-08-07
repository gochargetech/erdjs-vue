import { ref, watch } from 'vue';
import type { Transaction } from '@multiversx/sdk-core/out';
import { Signature } from '@multiversx/sdk-core/out/signature';

import {
  sendSignedTransactions as defaultSendSignedTxs,
  type SendSignedTransactionsReturnType
} from 'erdjs-vue/apiCalls/transactions';
import { newTransaction } from 'erdjs-vue/models/newTransaction';
import { useAccountStore } from 'erdjs-vue/store/erdjsAccountInfo';
import { useTransactionsStore } from 'erdjs-vue/store/erdjsTransactions';
import {
  TransactionBatchStatusesEnum,
  TransactionServerStatusesEnum
} from 'erdjs-vue/types/enums.types';
import type { SignedTransactionsBodyType } from 'erdjs-vue/types/transactions.types';

import { setNonce } from 'erdjs-vue/utils/account/setNonce';
import { safeRedirect } from 'erdjs-vue/utils/redirect';

export interface TransactionSenderType {
  sendSignedTransactionsAsync?: (
    signedTransactions: Transaction[]
  ) => Promise<SendSignedTransactionsReturnType>;
}

/**
 * Function used to redirect after sending because of Safari cancelling async requests on page change
 */
const optionalRedirect = (sessionInformation: SignedTransactionsBodyType) => {
  const redirectRoute = sessionInformation.redirectRoute;
  if (redirectRoute) {
    safeRedirect(redirectRoute);
  }
};

export const transactionSender = ({
  sendSignedTransactionsAsync = defaultSendSignedTxs
}: TransactionSenderType) => {
  const account = useAccountStore().getAccount;
  const signedTransactions = useTransactionsStore().getSignedTransactions;

  const sendingRef = ref(false);

  const clearSignInfo = () => {
    useTransactionsStore().clearAllTransactionsToSign();
    sendingRef.value = false;
  };
  async function handleSendTransactions() {
    const sessionIds = Object.keys(signedTransactions);
    for (const sessionId of sessionIds) {
      const sessionInformation = signedTransactions?.[sessionId];
      const skipSending =
        sessionInformation?.customTransactionInformation?.signWithoutSending;

      if (!sessionId || skipSending) {
        optionalRedirect(sessionInformation);
        continue;
      }

      try {
        const isSessionIdSigned =
          signedTransactions[sessionId].status ===
          TransactionBatchStatusesEnum.signed;
        const shouldSendCurrentSession =
          isSessionIdSigned && !sendingRef.value;
        if (!shouldSendCurrentSession) {
          continue;
        }
        const { transactions } = signedTransactions[sessionId];

        if (!transactions) {
          continue;
        }
        sendingRef.value = true;
        const transactionsToSend = transactions.map((tx) => {
          const transactionObject = newTransaction(tx);
          const signature = new Signature(tx.signature);

          transactionObject.applySignature(signature);
          return transactionObject;
        });
        const responseHashes = await sendSignedTransactionsAsync(
          transactionsToSend
        );

        const newStatus = TransactionServerStatusesEnum.pending;
        const newTransactions = transactions.map((transaction) => {
          if (responseHashes.includes(transaction.hash)) {
            return { ...transaction, status: newStatus };
          }

          return transaction;
        });

        // const submittedModalPayload = {
        //   sessionId,
        //   submittedMessage: 'submitted'
        // };

        // dispatch(setTxSubmittedModal(submittedModalPayload));
        useTransactionsStore()
          .updateSignedTransactions({
            sessionId,
            status: TransactionBatchStatusesEnum.sent,
            transactions: newTransactions
          });
        clearSignInfo();
        // @ts-ignore
        setNonce(account.nonce + transactions.length);

        optionalRedirect(sessionInformation);

        history.pushState({}, document?.title, '?');
      } catch (error) {
        console.error('Unable to send transactions', error);
        useTransactionsStore()
          .updateSignedTransactions({
            sessionId,
            status: TransactionBatchStatusesEnum.fail,
            errorMessage: (error as any).message
          });
        clearSignInfo();
      } finally {
        sendingRef.value = false;
      }
    }
  }

  watch([signedTransactions, account], () => {
    handleSendTransactions();
  }, {
    immediate: true
  });

  return null;
};
