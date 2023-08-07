import type { Transaction } from '@multiversx/sdk-core';
import { getEnvironmentForChainId } from 'erdjs-vue/apiCalls/configuration';
import {
  WALLET_SIGN_SESSION,
  fallbackNetworkConfigurations
} from 'erdjs-vue/constants/index';

import { newWalletProvider } from 'erdjs-vue/providers/utils';
import { builtCallbackUrl } from 'erdjs-vue/utils/transactions/builtCallbackUrl';
import { getWindowLocation } from 'erdjs-vue/utils/window/getWindowLocation';
import { getAreAllTransactionsSignedByGuardian } from 'erdjs-vue/hooks/transactions/helpers/getAreAllTransactionsSignedByGuardian';

interface SendTransactionsToGuardianType {
  transactions: Transaction[];
  hasGuardianScreen?: boolean;
  isGuarded?: boolean;
  callbackRoute?: string;
  sessionId?: string;
  walletAddress?: string;
}

export const checkNeedsGuardianSigning = ({
  transactions,
  hasGuardianScreen,
  callbackRoute,
  sessionId,
  walletAddress,
  isGuarded
}: SendTransactionsToGuardianType) => {
  const allSignedByGuardian = getAreAllTransactionsSignedByGuardian({
    isGuarded,
    transactions
  });

  /**
   * Redirect to wallet for signing if:
   * - account is guarded &
   * - 2FA will not be provided locally &
   * - transactions were not signed by guardian
   */
  const sendTransactionsToGuardian = () => {
    const chainId = transactions[0].getChainID().valueOf();
    const environment = getEnvironmentForChainId(chainId);
    const walletProviderAddress =
      walletAddress ?? fallbackNetworkConfigurations[environment].walletAddress;
    const walletProvider = newWalletProvider(walletProviderAddress);
    const urlParams = { [WALLET_SIGN_SESSION]: String(sessionId) };
    const { origin } = getWindowLocation();
    const callbackUrl = window?.location
      ? `${origin}${callbackRoute}`
      : `${callbackRoute}`;
    const builtedCallbackUrl = builtCallbackUrl({ callbackUrl, urlParams });

    walletProvider.guardTransactions(transactions, {
      callbackUrl: encodeURIComponent(builtedCallbackUrl)
    });
  };

  const needs2FaSigning =
    !hasGuardianScreen && !allSignedByGuardian && sessionId;

  return {
    needs2FaSigning: isGuarded ? needs2FaSigning : false,
    sendTransactionsToGuardian
  };
};
