import { ref, watch } from "vue";
import type { Transaction } from '@elrondnetwork/erdjs';

import { useParseMultiEsdtTransferData } from 'erdjs-vue/hooks/transactions/useParseMultiEsdtTransferData';
import type {
  ActiveLedgerTransactionType,
  MultiSignTransactionType,
  ScamInfoType
} from 'erdjs-vue/types';
import { getLedgerErrorCodes } from 'erdjs-vue/utils/internal/getLedgerErrorCodes';
import { isTokenTransfer } from 'erdjs-vue/utils/transactions/isTokenTransfer';

export interface UseSignMultipleTransactionsPropsType {
  egldLabel: string;
  address: string;
  verifyReceiverScam?: boolean;
  isLedger?: boolean;
  transactionsToSign?: Transaction[];
  onCancel?: () => void;
  onSignTransaction: (transaction: Transaction) => Promise<Transaction>;
  onTransactionsSignSuccess: (transactions: Transaction[]) => void;
  onTransactionsSignError: (errorMessage: string) => void;
  onGetScamAddressData?:
  | ((address: string) => Promise<{ scamInfo?: ScamInfoType }>)
  | null;
}

interface VerifiedAddressesType {
  [address: string]: { type: string; info: string };
}
let verifiedAddresses: VerifiedAddressesType = {};

type DeviceSignedTransactions = Record<number, Transaction>;

export interface UseSignMultipleTransactionsReturnType {
  allTransactions: MultiSignTransactionType[];
  onSignTransaction: () => void;
  onNext: () => void;
  onPrev: () => void;
  onAbort: () => void;
  waitingForDevice: boolean;
  shouldContinueWithoutSigning: boolean;
  isFirstTransaction: boolean;
  isLastTransaction: boolean;
  hasMultipleTransactions: boolean;
  currentStep: number;
  signedTransactions?: DeviceSignedTransactions;
  currentTransaction: ActiveLedgerTransactionType | null;
}

export function useSignMultipleTransactions({
  isLedger = false,
  transactionsToSign,
  egldLabel,
  address,
  onCancel,
  onSignTransaction,
  onTransactionsSignError,
  onTransactionsSignSuccess,
  onGetScamAddressData
}: UseSignMultipleTransactionsPropsType): UseSignMultipleTransactionsReturnType {
  const currentStep = ref(0);
  let signedTransactions: DeviceSignedTransactions | undefined;
  let currentTransaction: ActiveLedgerTransactionType | null = null;

  let waitingForDevice = false;

  const {
    getTxInfoByDataField,
    allTransactions
  } = useParseMultiEsdtTransferData({ transactions: transactionsToSign });

  const isLastTransaction = currentStep.value === allTransactions.length - 1;

  watch(currentStep, () => {
    extractTransactionsInfo();
  }, {
    immediate: true
  });

  watch(allTransactions, () => {
    extractTransactionsInfo();
  }, {
    immediate: true
  });

  async function extractTransactionsInfo() {
    const tx = allTransactions[currentStep.value];
    if (tx == null) {
      return;
    }
    const { transaction, multiTxData } = tx;
    const dataField = transaction.getData().toString();
    const transactionTokenInfo = getTxInfoByDataField(
      transaction.getData().toString(),
      multiTxData
    );
    const { tokenId } = transactionTokenInfo;
    const receiver = transaction.getReceiver().toString();
    const notSender = address !== receiver;
    const verified = receiver in verifiedAddresses;

    if (notSender && !verified && onGetScamAddressData != null) {
      const data = await onGetScamAddressData(receiver);
      verifiedAddresses = {
        ...verifiedAddresses,
        ...(data?.scamInfo ? { [receiver]: data.scamInfo } : {})
      };
    }

    const isTokenTransaction = Boolean(
      tokenId && isTokenTransfer({ tokenId, erdLabel: egldLabel })
    );

    currentTransaction = {
      transaction,
      receiverScamInfo: verifiedAddresses[receiver]?.info || null,
      transactionTokenInfo,
      isTokenTransaction,
      dataField
    };
  }

  function reset() {
    currentStep.value = 0;
    signedTransactions = undefined;
    waitingForDevice = false;
  }

  async function sign() {
    try {
      if (currentTransaction == null) {
        return;
      }

      waitingForDevice = isLedger;

      const signedTx = await onSignTransaction(currentTransaction?.transaction as Transaction);
      const newSignedTx = { [currentStep.value]: signedTx };
      const newSignedTransactions = signedTransactions
        ? { ...signedTransactions, ...newSignedTx }
        : newSignedTx;
      signedTransactions = newSignedTransactions;
      if (!isLastTransaction) {
        currentStep.value = currentStep.value + 1;
        waitingForDevice = false;
      } else if (newSignedTransactions) {
        onTransactionsSignSuccess(Object.values(newSignedTransactions));
        reset();
      }
    } catch (err) {
      console.error(err, 'sign error');
      const { message } = err as any;
      const errorMessage = isLedger
        ? getLedgerErrorCodes(err).errorMessage
        : null;

      reset();
      onTransactionsSignError(errorMessage ?? message);
    }
  }

  function signTx() {
    try {
      if (currentTransaction == null) {
        return;
      }
      const signature = currentTransaction.transaction.getSignature();
      if (signature.hex()) {
        if (!isLastTransaction) {
          currentStep.value = currentStep.value + 1;
        }
      } else {
        // currently code doesn't reach here because getSignature throws error if none is found
        sign();
      }
    } catch {
      // the only way to check if tx has signature is with try catch
      sign();
    }
  }

  const isFirst = currentStep.value === 0;

  function handleAbort() {
    if (isFirst) {
      onCancel?.();
    } else {
      currentStep.value = currentStep.value - 1;
    }
  }

  const shouldContinueWithoutSigning = Boolean(
    // @ts-ignore
    currentTransaction?.transactionTokenInfo?.type &&
    // @ts-ignore
    currentTransaction?.transactionTokenInfo?.multiTxData &&
    // @ts-ignore
    !currentTransaction?.dataField.endsWith(
      // @ts-ignore
      currentTransaction?.transactionTokenInfo?.multiTxData
    )
  );

  function handleSignTransaction() {
    if (shouldContinueWithoutSigning) {
      currentStep.value = currentStep.value + 1;
    } else {
      signTx();
    }
  }

  function onNext() {
    const nextStep = currentStep.value + 1;
    if (nextStep > allTransactions?.length) {
      return;
    }

    currentStep.value = currentStep.value + 1;
  }


  function onPrev() {
    const nextStep = currentStep.value + 1;
    if (nextStep < 0) {
      return;
    }
    currentStep.value = currentStep.value - 1;
  }

  return {
    allTransactions,
    onSignTransaction: handleSignTransaction,
    onNext,
    onPrev,
    waitingForDevice,
    onAbort: handleAbort,
    isLastTransaction,
    isFirstTransaction: currentStep.value === 0,
    hasMultipleTransactions: allTransactions.length > 1,
    shouldContinueWithoutSigning,
    currentStep: currentStep.value,
    signedTransactions,
    currentTransaction
  };
}
