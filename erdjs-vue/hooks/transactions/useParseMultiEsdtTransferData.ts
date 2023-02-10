import { ref, watch } from "vue";
import type { Transaction } from '@multiversx/sdk-core';
import type {
  MultiSignTransactionType,
  TransactionDataTokenType,
  TransactionsDataTokensType
} from 'erdjs-vue/types';
import { getTokenFromData } from 'erdjs-vue/utils/transactions/getTokenFromData';
import { parseMultiEsdtTransferData } from 'erdjs-vue/utils/transactions/parseMultiEsdtTransferData';

const defaultTransactionInfo: TransactionDataTokenType = {
  tokenId: '',
  amount: '',
  type: '',
  multiTxData: '',
  receiver: ''
};

interface UseParseMultiEsdtTransferDataPropsType {
  transactions?: Transaction[];
}

interface UseParseMultiEsdtTransferDataReturnType {
  parsedTransactionsByDataField: TransactionsDataTokensType;
  getTxInfoByDataField: (
    data: string,
    multiTransactionData?: string
  ) => TransactionDataTokenType;
  allTransactions: MultiSignTransactionType[];
}

export function useParseMultiEsdtTransferData({
  transactions
}: UseParseMultiEsdtTransferDataPropsType): UseParseMultiEsdtTransferDataReturnType {
  let parsedTransactionsByDataField: TransactionsDataTokensType = {};
  let allTransactions: MultiSignTransactionType[] = [];

  function addTransactionDataToParsedInfo(
    data: string,
    txInfo: TransactionDataTokenType
  ) {
    parsedTransactionsByDataField = {
      ...parsedTransactionsByDataField,
      [data]: txInfo
    };
  }

  function getTxInfoByDataField(
    data: string,
    multiTransactionData?: string
  ): TransactionDataTokenType {
    if (parsedTransactionsByDataField == null) {
      return defaultTransactionInfo;
    }

    if (data in parsedTransactionsByDataField) {
      return parsedTransactionsByDataField[data];
    }

    if (
      multiTransactionData != null &&
      String(multiTransactionData) in parsedTransactionsByDataField
    ) {
      return parsedTransactionsByDataField[multiTransactionData];
    }

    return defaultTransactionInfo;
  }

  function extractTransactionESDTData() {
    if (transactions && transactions.length > 0) {
      const allTxs: MultiSignTransactionType[] = [];
      transactions.forEach((transaction, transactionIndex) => {
        const txData = transaction.getData().toString();
        const multiTxs = parseMultiEsdtTransferData(txData);

        if (multiTxs.length > 0) {
          multiTxs.forEach((trx, idx) => {
            const newTx: MultiSignTransactionType = {
              transaction,
              multiTxData: trx.data,
              transactionIndex: idx
            };
            addTransactionDataToParsedInfo(trx.data, {
              tokenId: trx.token ? trx.token : '',
              amount: trx.amount ? trx.amount : '',
              type: trx.type,
              nonce: trx.nonce ? trx.nonce : '',
              multiTxData: trx.data,
              receiver: trx.receiver
            });
            allTxs.push(newTx);
          });
        } else {
          const { tokenId, amount } = getTokenFromData(
            transaction.getData().toString()
          );

          if (tokenId) {
            addTransactionDataToParsedInfo(transaction.getData().toString(), {
              tokenId,
              amount,
              receiver: transaction.getReceiver().bech32()
            });
          }
          allTxs.push({ transaction, transactionIndex });
        }
      });
      allTransactions = allTxs;
    }
  }

  const transactionsRef = ref(transactions?.length);
  watch(transactionsRef, () => {
    extractTransactionESDTData();
  }, {
    immediate: true
  });

  return {
    parsedTransactionsByDataField,
    getTxInfoByDataField,
    allTransactions
  };
}
