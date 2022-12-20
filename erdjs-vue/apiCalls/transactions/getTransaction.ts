import axios from 'axios';
import type { ServerTransactionType } from 'erdjs-vue/types/serverTransactions.types';
import { TRANSACTIONS_ENDPOINT } from 'erdjs-vue/apiCalls/endpoints';
import { getTimeout } from './helpers';

export interface GetTransactionType {
  apiAddress: string;
  apiTimeout?: string | number;
  hash: string;
}

export const getTransaction = ({
  hash,
  apiAddress,
  apiTimeout
}: GetTransactionType) => {
  return axios.get<ServerTransactionType[]>(
    `${apiAddress}/${TRANSACTIONS_ENDPOINT}/${hash}`,
    {
      ...getTimeout(apiTimeout)
    }
  );
};
