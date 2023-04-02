import BigNumber from 'bignumber.js';
import { GAS_LIMIT } from 'erdjs-vue/constants/index';
import { type IGasLimit, Address } from '@multiversx/sdk-core';

import { useAccountStore } from 'erdjs-vue/store/erdjsAccountInfo';
import { useDappStore } from 'erdjs-vue/store/erdjsDapp';
import { useNotificationsStore } from 'erdjs-vue/store/erdjsNotifications';

import {
  NotificationTypesEnum,
  type SendTransactionReturnType,
  type SignTransactionsPropsType
} from 'erdjs-vue/types';
import { stringIsFloat } from 'erdjs-vue/utils/validation/stringIsFloat';
import { calcTotalFee } from './utils';
import { useTransactionsStore } from 'erdjs-vue/store/erdjsTransactions';
import { useTransactionsInfoStore } from 'erdjs-vue/store/erdjsTransactionsInfo';
import { calculateGasLimit } from 'erdjs-vue/services/transactions/transformAndSignTransactions';
import { isContract } from 'erdjs-vue/utils/operations/smartContracts';

export async function signTransactions({
  transactions,
  callbackRoute,
  minGasLimit = GAS_LIMIT,
  customTransactionInformation,
  transactionsDisplayInfo
}: SignTransactionsPropsType): Promise<SendTransactionReturnType> {
  const sessionId = Date.now().toString();
  const accountBalance = useAccountStore().getAccountBalance;

  const storeChainId = useDappStore().getChainId;

  const transactionsPayload = Array.isArray(transactions)
    ? transactions
    : [transactions];
  const bNtotalFee = calcTotalFee(transactionsPayload, minGasLimit);
  const bNbalance = new BigNumber(
    stringIsFloat(accountBalance) ? accountBalance : '0'
  );
  const hasSufficientFunds = bNbalance.minus(bNtotalFee).isGreaterThan(0);

  if (!hasSufficientFunds) {
    const notificationPayload = {
      type: NotificationTypesEnum.warning,
      title: 'Insufficient EGLD funds',
      description: 'Current EGLD balance cannot cover the transaction fees.'
    };
    useNotificationsStore().addNotification(notificationPayload);

    return { error: 'insufficient funds', sessionId: null };
  }

  const hasValidChainId = transactionsPayload?.every(
    (tx) => tx.getChainID().valueOf() === storeChainId.valueOf()
  );
  if (!hasValidChainId) {
    const notificationPayload = {
      type: NotificationTypesEnum.warning,
      title: 'Network change detected',
      description: 'The application tried to change the transaction network'
    };
    useNotificationsStore().addNotification(notificationPayload);

    return { error: 'Invalid ChainID', sessionId: null };
  }

  const currentAddress = useAccountStore().getAddress;

  const signTransactionsPayload = {
    sessionId,
    callbackRoute,
    customTransactionInformation,
    transactions: transactionsPayload.map((tx) => {
      let gasLimit = Number(calculateGasLimit(tx.getData().valueOf().toString()));

      if (tx.getSender().valueOf().toString() !== currentAddress) {
        tx.sender = new Address(currentAddress);
      }

      // TODO: implement correct gas cost calculation.
      // @see https://gateway.elrond.com/network/gas-configs
      const receiver = tx.getReceiver().valueOf().toString();
      const txToContract = isContract(receiver);
      if (txToContract) {
        gasLimit += 5000000;
      }

      tx.setGasLimit(gasLimit as IGasLimit);
      return tx.toPlainObject()
    })
  };
  useTransactionsStore().setSignTransactionsCancelMessage(null);
  useTransactionsStore().setTransactionsToSign(signTransactionsPayload);

  const notificationPayload = {
    type: NotificationTypesEnum.success,
    title: 'Testing',
    description: 'Lorem ipsum dolor vet.'
  };
  useNotificationsStore().addNotification(notificationPayload);

  useTransactionsInfoStore().setTransactionsDisplayInfo({ sessionId, transactionsDisplayInfo })

  return { sessionId };
}
