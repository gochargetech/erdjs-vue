import type { Transaction } from '@multiversx/sdk-core';
import { getScamAddressData } from 'erdjs-vue/apiCalls/getScamAddressData';
import { useGetAccountInfo } from 'erdjs-vue/hooks/account/useGetAccountInfo';
import { useGetAccountProvider } from 'erdjs-vue/hooks/account/useGetAccountProvider';
import { useSignMultipleTransactions } from 'erdjs-vue/hooks/transactions/useSignMultipleTransactions';
import { useTransactionsStore } from 'erdjs-vue/store/erdjsTransactions';

import {
  type ActiveLedgerTransactionType,
  LoginMethodsEnum,
  type MultiSignTransactionType,
  TransactionBatchStatusesEnum
} from 'erdjs-vue/types';
import { getIsProviderEqualTo } from 'erdjs-vue/utils/account/getIsProviderEqualTo';
import { safeRedirect } from 'erdjs-vue/utils/redirect';
import { parseTransactionAfterSigning } from 'erdjs-vue/utils/transactions/parseTransactionAfterSigning';
import { useDappStore } from 'erdjs-vue/store/erdjsDapp';
import { getShouldMoveTransactionsToSignedState } from './helpers/getShouldMoveTransactionsToSignedState';
import { useClearTransactionsToSignWithWarning } from './helpers/useClearTransactionsToSignWithWarning';
import { useGetLedgerProvider } from 'erdjs-vue/hooks/transactions/helpers';

export interface UseSignTransactionsWithDevicePropsType {
  onCancel: () => void;
  verifyReceiverScam?: boolean;
}

type DeviceSignedTransactions = Record<number, Transaction>;

export interface UseSignTransactionsWithDeviceReturnType {
  allTransactions: MultiSignTransactionType[];
  onSignTransaction: () => void;
  onNext: () => void;
  onPrev: () => void;
  onAbort: () => void;
  waitingForDevice: boolean;
  isLastTransaction: boolean;
  callbackRoute?: string;
  currentStep: number;
  signedTransactions?: DeviceSignedTransactions;
  currentTransaction: ActiveLedgerTransactionType | null;
}

export function useSignTransactionsWithDevice({
  onCancel,
  verifyReceiverScam = true
}: UseSignTransactionsWithDevicePropsType): UseSignTransactionsWithDeviceReturnType {
  const transactionsToSign = useTransactionsStore().getTransactionsToSign;
  const egldLabel = useDappStore().getEgldLabel;
  const account = useGetAccountInfo();
  // const address = account.address;
  const { address, isGuarded, activeGuardianAddress } = account;
  const { provider, providerType } = useGetAccountProvider();
  const clearTransactionsToSignWithWarning = useClearTransactionsToSignWithWarning();
  const getLedgerProvider = useGetLedgerProvider();

  const {
    transactions,
    sessionId,
    callbackRoute,
    customTransactionInformation
  } = transactionsToSign || {};

  function handleTransactionSignError(errorMessage: string) {
    useTransactionsStore().setSignTransactionsError(errorMessage);
  }

  const locationIncludesCallbackRoute =
    callbackRoute != null && window.location.pathname.includes(callbackRoute);

  function handleTransactionsSignSuccess(newSignedTransactions: Transaction[]) {
    const shouldMoveTransactionsToSignedState = getShouldMoveTransactionsToSignedState(
      newSignedTransactions
    );

    if (!shouldMoveTransactionsToSignedState) {
      return;
    }

    if (sessionId) {
      useTransactionsStore()
        .moveTransactionsToSignedState({
          sessionId: sessionId,
          status: TransactionBatchStatusesEnum.signed,
          transactions: newSignedTransactions.map((tx) =>
            parseTransactionAfterSigning(tx)
          )
        });

      if (
        callbackRoute != null &&
        customTransactionInformation?.redirectAfterSign &&
        !locationIncludesCallbackRoute
      ) {
        safeRedirect(callbackRoute);
      }
    }
  }

  function handleCancel() {
    onCancel();
    clearTransactionsToSignWithWarning(sessionId);
  }

  async function handleSignTransaction(transaction: Transaction) {
    const connectedProvider =
      providerType !== LoginMethodsEnum.ledger
        ? provider
        : await getLedgerProvider();

    return await connectedProvider.signTransaction(transaction);
  }

  const signMultipleTxReturnValues = useSignMultipleTransactions({
    address,
    egldLabel,
    activeGuardianAddress:
      isGuarded ? activeGuardianAddress : undefined,
    transactionsToSign: transactions,
    onGetScamAddressData: verifyReceiverScam ? getScamAddressData : null,
    isLedger: getIsProviderEqualTo(LoginMethodsEnum.ledger),
    onCancel: handleCancel,
    // @ts-ignore
    onSignTransaction: handleSignTransaction,
    onTransactionsSignError: handleTransactionSignError,
    onTransactionsSignSuccess: handleTransactionsSignSuccess
  });
  return { ...signMultipleTxReturnValues, callbackRoute };
}
