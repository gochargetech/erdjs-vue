import axios from 'axios';
import { TRANSACTIONS_ENDPOINT } from 'erdjs-vue/apiCalls/endpoints';
import type { ServerTransactionType } from 'erdjs-vue/types';
import type { GetTransactionsType } from 'erdjs-vue/apiCalls/transactions/getTransactions.types';
import { getTimeout, getTransactionsParams } from './helpers';

export const getTransactions = (props: GetTransactionsType) => {
  const params = getTransactionsParams(props);
  return axios.get<ServerTransactionType[]>(
    `${props.apiAddress}/${TRANSACTIONS_ENDPOINT}`,
    {
      params,
      ...getTimeout(props.apiTimeout)
    }
  );
};
