import BigNumber from 'bignumber.js';
import {
  type MultiEsdtTransactionType,
  TransactionTypesEnum
} from 'erdjs-vue/types';
import { decodePart } from 'erdjs-vue/utils/decoders/decodePart';
import { getAllStringOccurrences } from '../getAllStringOccurrences';

// TODO: add tests
export function parseMultiEsdtTransferData(data?: string) {
  const transactions: MultiEsdtTransactionType[] = [];
  let contractCallDataIndex = 0;
  try {
    if (
      data?.startsWith(TransactionTypesEnum.MultiESDTNFTTransfer) &&
      data?.includes('@')
    ) {
      const [, receiver, encodedTxCount, ...rest] = data?.split('@');
      if (receiver) {
        const txCount = new BigNumber(encodedTxCount, 16).toNumber();

        let itemIndex = 0;
        for (let txIndex = 0; txIndex < txCount; txIndex++) {
          const transaction: MultiEsdtTransactionType = {
            type: TransactionTypesEnum.nftTransaction,
            data: '',
            receiver
          };

          for (let index = 0; index < 3; index++) {
            switch (index) {
              case 0:
                transaction.token = decodePart(rest[itemIndex]);
                transaction.data = rest[itemIndex];
                break;
              case 1: {
                const encodedNonce =
                  rest[itemIndex] && rest[itemIndex].length
                    ? rest[itemIndex]
                    : '';
                if (encodedNonce) {
                  transaction.nonce = encodedNonce;
                } else {
                  transaction.type = TransactionTypesEnum.esdtTransaction;
                }
                transaction.data = `${transaction.data}@${rest[itemIndex]}`;
                break;
              }
              case 2:
                transaction.amount = new BigNumber(
                  rest[itemIndex],
                  16
                ).toString(10);
                transaction.data = `${transaction.data}@${rest[itemIndex]}`;
                break;
              default:
                break;
            }
            contractCallDataIndex = itemIndex + 1;
            itemIndex++;
          }
          transactions[txIndex] = transaction;
        }

        const isDifferentFromTxCount = transactions.length !== txCount;
        const hasInvalidNoOfAdSigns = transactions.some((tx) => {
          const adSignOccurences = getAllStringOccurrences(tx.data, '@').length;
          return adSignOccurences !== 2;
        });
        const hasAdStart = transactions.some((tx) => tx.data.startsWith('@'));
        if (isDifferentFromTxCount || hasInvalidNoOfAdSigns || hasAdStart) {
          return [];
        }
        if (rest[contractCallDataIndex]) {
          let scCallData = rest[contractCallDataIndex];
          for (let i = contractCallDataIndex + 1; i < rest.length; i++) {
            scCallData += '@' + rest[i];
          }
          transactions[txCount] = {
            type: TransactionTypesEnum.scCall,
            data: scCallData,
            receiver
          };
        }
      }
    }
  } catch (err) {
    console.error('failed parsing tx', err);
    return transactions;
  }
  return transactions;
}
