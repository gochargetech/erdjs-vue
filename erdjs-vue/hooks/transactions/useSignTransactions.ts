import {
  type Transaction,
  TransactionOptions,
  TransactionVersion
} from '@multiversx/sdk-core';

import { ExtensionProvider } from '@multiversx/sdk-extension-provider';
import { ref, watch } from "vue";

import {
  ERROR_SIGNING,
  ERROR_SIGNING_TX,
  MISSING_PROVIDER_MESSAGE,
  PROVIDER_NOT_INITIALIZED,
  TRANSACTION_CANCELLED,
  WALLET_SIGN_SESSION
} from 'erdjs-vue/constants/index';
import { useGetAccountProvider } from 'erdjs-vue/hooks/account/useGetAccountProvider';
import { useParseSignedTransactions } from 'erdjs-vue/hooks/transactions/useParseSignedTransactions';

import { useAccountStore } from 'erdjs-vue/store/erdjsAccountInfo';
import {
  useTransactionsStore,
  type MoveTransactionsToSignedStatePayloadType
} from 'erdjs-vue/store/erdjsTransactions';
import { useTransactionsInfoStore } from 'erdjs-vue/store/erdjsTransactionsInfo';

import {
  LoginMethodsEnum,
  TransactionBatchStatusesEnum
} from 'erdjs-vue/types/enums.types';
import { getProviderType } from 'erdjs-vue/providers/utils';
import { getAccount } from 'erdjs-vue/utils/account/getAccount';
import { getLatestNonce } from 'erdjs-vue/utils/account/getLatestNonce';
import { builtCallbackUrl } from 'erdjs-vue/utils/transactions/builtCallbackUrl';
import { parseTransactionAfterSigning } from 'erdjs-vue/utils/transactions/parseTransactionAfterSigning';

import { getShouldMoveTransactionsToSignedState } from './helpers/getShouldMoveTransactionsToSignedState';
import { useSignTransactionsCommonData } from './useSignTransactionsCommonData';



const setTransactionNonces = (
  latestNonce: number,
  transactions: Array<Transaction>
): Array<Transaction> => {
  return transactions.map((tx: Transaction, index: number) => {
    tx.setNonce(latestNonce + index);

    return tx;
  });
};

export const useSignTransactions = () => {
  const savedCallback = ref('/');
  const account = useAccountStore();
  const { address, isGuarded, activeGuardianAddress } = account;
  const { provider } = useGetAccountProvider();
  const providerType = getProviderType(provider);
  const isSigningRef = ref(false);


  const signTransactionsCancelMessage = useTransactionsStore().getSignTransactionsCancelMessage;

  const {
    transactionsToSign,
    error,
    setError,
    hasTransactions,
    onAbort,
    clearTransactionStatusMessage
  } = useSignTransactionsCommonData();

  useParseSignedTransactions(onAbort);

  function clearSignInfo(sessionId?: string) {
    const isExtensionProvider = provider instanceof ExtensionProvider;

    useTransactionsStore().clearAllTransactionsToSign;
    useTransactionsInfoStore().clearTransactionsInfoForSessionId(sessionId);

    if (!isExtensionProvider) {
      return;
    }

    clearTransactionStatusMessage();
    ExtensionProvider.getInstance()?.cancelAction?.();
  }

  const onCancel = (errorMessage: string, sessionId?: string) => {
    const isTxCancelled = errorMessage.includes(TRANSACTION_CANCELLED);
    clearSignInfo(sessionId);

    /*
     * this is triggered by abort action,
     * so no need to show error
     */
    if (isTxCancelled) {
      useTransactionsStore().setSignTransactionsCancelMessage(TRANSACTION_CANCELLED);
      return;
    }

    setError(errorMessage);
  };

  const signWithWallet = (
    transactions: Array<Transaction>,
    sessionId: string,
    callbackRoute = ''
  ) => {
    const urlParams = { [WALLET_SIGN_SESSION]: sessionId };
    const callbackUrl = `${window.location.origin}${callbackRoute}`;
    const buildedCallbackUrl = builtCallbackUrl({ callbackUrl, urlParams });

    const txsToSign = isGuarded
      ? transactions.map((transaction) => {
        transaction.setVersion(TransactionVersion.withTxOptions());
        transaction.setOptions(
          TransactionOptions.withOptions({ guarded: true })
        );

        return transaction;
      })
      : transactions

    // @ts-ignore
    provider.signTransactions(txsToSign, {
      callbackUrl: encodeURIComponent(buildedCallbackUrl)
    });
  };

  const signTransactionsWithProvider = async () => {
    if (isSigningRef.value) {
      return;
    }

    const {
      sessionId,
      transactions,
      callbackRoute,
      customTransactionInformation
    } = transactionsToSign!;
    const { redirectAfterSign } = customTransactionInformation;
    const redirectRoute = callbackRoute || window.location.pathname;
    const isCurrentRoute = window.location.pathname.includes(redirectRoute);
    const shouldRedirectAfterSign = redirectAfterSign && !isCurrentRoute;

    try {
      // @ts-ignore
      const isProviderInitialized = await provider?.init?.();

      if (!isProviderInitialized) {
        return;
      }
    } catch (error) {
      const errorMessage =
        (error as Error)?.message ||
        (error as string) ||
        PROVIDER_NOT_INITIALIZED;
      onCancel(errorMessage);

      return;
    }

    try {
      isSigningRef.value = true;

      // @ts-ignore
      const signedTransactions: Transaction[] = await provider.signTransactions(
        transactions
      );
      isSigningRef.value = false;

      const shouldMoveTransactionsToSignedState = getShouldMoveTransactionsToSignedState(
        signedTransactions
      );

      if (!shouldMoveTransactionsToSignedState) {
        return;
      }

      const signedTransactionsArray = Object.values(
        signedTransactions
      ).map((tx) => parseTransactionAfterSigning(tx));

      const payload: MoveTransactionsToSignedStatePayloadType = {
        sessionId,
        transactions: signedTransactionsArray,
        status: TransactionBatchStatusesEnum.signed
      };

      // redirect is delegated to optionalRedirect in TransactionSender
      if (shouldRedirectAfterSign) {
        payload.redirectRoute = redirectRoute;
      }

      useTransactionsStore().moveTransactionsToSignedState(payload);
    } catch (error) {
      isSigningRef.value = false;

      const errorMessage =
        (error as Error)?.message || (error as string) || ERROR_SIGNING_TX;
      console.error(errorMessage);

      useTransactionsStore().moveTransactionsToSignedState({
        sessionId,
        status: TransactionBatchStatusesEnum.cancelled
      });
      onCancel(
        errorMessage.includes('cancel') ? TRANSACTION_CANCELLED : errorMessage,
        sessionId
      );
    }
  };

  const signTransactions = async () => {
    if (!transactionsToSign) {
      return;
    }

    clearTransactionStatusMessage();

    const { sessionId, transactions, callbackRoute } = transactionsToSign;

    if (!provider) {
      console.error(MISSING_PROVIDER_MESSAGE);
      return;
    }

    /*
     * if the transaction is cancelled
     * the callback will go to undefined,
     * we save the most recent one for a valid transaction
     */
    savedCallback.value = callbackRoute || window.location.pathname;

    try {
      const account = await getAccount(address);
      if (account == null) {
        return;
      }
      const isSigningWithWebWallet = providerType === LoginMethodsEnum.wallet;

      const latestNonce = getLatestNonce(account);
      const mappedTransactions = setTransactionNonces(
        latestNonce,
        transactions
      );

      if (isSigningWithWebWallet) {
        return signWithWallet(mappedTransactions, sessionId, callbackRoute);
      }

      signTransactionsWithProvider();
    } catch (err) {
      const defaultErrorMessage = (err as Error)?.message;
      const errorMessage = defaultErrorMessage || ERROR_SIGNING;
      console.error(errorMessage);

      onCancel(errorMessage, sessionId);

      useTransactionsStore().moveTransactionsToSignedState({
        sessionId,
        status: TransactionBatchStatusesEnum.cancelled
      });

      console.error(errorMessage, err);
    }
  };

  const transactionsToSignRef = ref(transactionsToSign);

  watch(transactionsToSignRef, () => {
    signTransactions()
  }, {
    immediate: true
  });

  return {
    error,
    canceledTransactionsMessage: signTransactionsCancelMessage,
    onAbort,
    hasTransactions,
    callbackRoute: savedCallback.value,
    sessionId: transactionsToSign?.sessionId,
    transactions: transactionsToSign?.transactions
  };
};
