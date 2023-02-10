import { ref, watch } from "vue";
import { WalletProvider } from '@multiversx/sdk-web-wallet-provider';
import qs from 'qs';
import { DAPP_INIT_ROUTE, WALLET_SIGN_SESSION } from 'erdjs-vue/constants/index';

import { useDappStore } from 'erdjs-vue/store/erdjsDapp';
import { useTransactionsStore } from 'erdjs-vue/store/erdjsTransactions';
import { TransactionBatchStatusesEnum } from 'erdjs-vue/types/enums.types';
import { parseTransactionAfterSigning } from 'erdjs-vue/utils/transactions/parseTransactionAfterSigning';

export function useParseSignedTransactions(
  onAbort: (sessionId?: string) => void
) {
  const { search } = window.location;
  const network = useDappStore().getNetworkConfig;
  const searchRef = ref(search);

  watch(searchRef, () => {
    if (search != null) {
      const searchData = qs.parse(search.replace('?', ''));

      if (searchData && WALLET_SIGN_SESSION in searchData) {
        const sessionId = String((searchData as any)[WALLET_SIGN_SESSION]);
        const signedTransactions = new WalletProvider(
          `${network.walletAddress}${DAPP_INIT_ROUTE}`
        ).getTransactionsFromWalletUrl();

        if (searchData.status === TransactionBatchStatusesEnum.cancelled) {
          useTransactionsStore()
            .moveTransactionsToSignedState({
              sessionId,
              status: TransactionBatchStatusesEnum.cancelled
            });
          onAbort();
          history.pushState({}, document?.title, '?');

          return;
        }
        if (signedTransactions.length > 0) {
          useTransactionsStore()
            .moveTransactionsToSignedState({
              sessionId,
              status: TransactionBatchStatusesEnum.signed,
              transactions: signedTransactions.map((tx) =>
                parseTransactionAfterSigning(tx)
              )
            });
          history.pushState({}, document?.title, '?');
        }
      }
    }
  }, {
    immediate: true
  })
}
