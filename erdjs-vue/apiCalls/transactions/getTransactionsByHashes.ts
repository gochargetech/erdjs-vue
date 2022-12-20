import axios from 'axios';
import { useDappStore } from 'erdjs-vue/store/erdjsDapp';
import type {
  GetTransactionsByHashesReturnType,
  PendingTransactionsType
} from 'erdjs-vue/types/transactions.types';

export async function getTransactionsByHashes(
  pendingTransactions: PendingTransactionsType
): Promise<GetTransactionsByHashesReturnType> {
  const apiAddress = useDappStore().getApiAddress;
  const hashes = pendingTransactions.map((tx: any) => tx.hash);
  const { data: responseData } = await axios.get(`${apiAddress}/transactions`, {
    params: {
      hashes: hashes.join(','),
      withScResults: true
    }
  });

  return pendingTransactions.map(({ hash, previousStatus }) => {
    const txOnNetwork = responseData.find(
      (txResponse: any) => txResponse?.txHash === hash
    );

    return {
      hash,
      data: txOnNetwork?.data,
      invalidTransaction: txOnNetwork == null,
      status: txOnNetwork?.status,
      results: txOnNetwork?.results,
      sender: txOnNetwork?.sender,
      receiver: txOnNetwork?.receiver,
      previousStatus,
      hasStatusChanged: txOnNetwork && txOnNetwork.status !== previousStatus
    };
  });
}
