import axios from 'axios';
import { TRANSACTIONS_COUNT_ENDPOINT } from 'erdjs-vue/apiCalls/endpoints';
import type { GetTransactionsType } from 'erdjs-vue/apiCalls/transactions/getTransactions.types';
import { getTimeout, getTransactionsParams } from './helpers';

export const getTransactionsCount = (props: GetTransactionsType) => {
  const params = getTransactionsParams(props);
  return axios.get<number>(
    `${props.apiAddress}/${TRANSACTIONS_COUNT_ENDPOINT}`,
    {
      params,
      ...getTimeout(props.apiTimeout)
    }
  );
};
