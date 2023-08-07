import { HWProvider } from '@multiversx/sdk-hw-provider';
import { SECOND_LOGIN_ATTEMPT_ERROR } from 'erdjs-vue/constants/errorsMessages';
import { getLedgerConfiguration } from 'erdjs-vue/providers';
import { setAccountProvider } from 'erdjs-vue/providers/accountProvider';

import { LoginMethodsEnum } from 'erdjs-vue/types/enums.types';
import { getLedgerErrorCodes, optionalRedirect } from 'erdjs-vue/utils/internal';
import type {
  InitiateLoginFunctionType,
  SelectAccountFunctionType,
  OnProviderLoginType
} from 'erdjs-vue/types/login.types';
import { getIsLoggedIn } from 'erdjs-vue/utils/getIsLoggedIn';
import { useAccountStore } from 'erdjs-vue/store/erdjsAccountInfo';
import { useLoginService } from './useLoginService';
import { useLoginInfoStore } from 'erdjs-vue/store/erdjsLoginInfo';

import { watch } from 'vue';
import { useLedgerStore } from 'erdjs-vue/store/erdjsLedger';
import { storeToRefs } from 'pinia';

const failInitializeErrorText = 'Check if the MultiversX App is open on Ledger';

export interface UseLedgerLoginPropsType extends OnProviderLoginType {
  addressesPerPage?: number;
}

export interface SelectedAddress {
  address: string;
  index: number;
}

export interface LedgerLoginHookCustomStateType {
  accounts: string[];
  showAddressList: boolean;
  startIndex: number;
  selectedAddress: SelectedAddress | null;
  version: string;
  contractDataEnabled: boolean;

  onGoToPrevPage: () => void;
  onGoToNextPage: () => void;
  onSelectAddress: (address: SelectedAddress | null) => void;
  onConfirmSelectedAddress: () => void;
}

export type LedgerLoginHookReturnType = [
  InitiateLoginFunctionType,
  SelectAccountFunctionType
];

export function useLedgerLogin({
  callbackRoute,
  token: tokenToSign,
  addressesPerPage: configuredAddressesPerPage,
  nativeAuth,
  onLoginRedirect
}: UseLedgerLoginPropsType): LedgerLoginHookReturnType {
  const ledgerAccount = useAccountStore().getLedgerAccount;
  const isLoggedIn = getIsLoggedIn();
  const hasNativeAuth = Boolean(nativeAuth);
  const loginService = useLoginService(nativeAuth);
  let token = tokenToSign;

  const addressesPerPage = configuredAddressesPerPage ?? 10;

  const hwWalletP = new HWProvider();
  const ledgerStore = useLedgerStore();

  function dispatchLoginActions({
    provider,
    address,
    index,
    signature
  }: {
    provider: HWProvider;
    address: string;
    index: number;
    signature?: string;
  }) {
    setAccountProvider(provider);

    useLoginInfoStore().setLedgerLogin({ index, loginType: LoginMethodsEnum.ledger });

    if (signature) {
      loginService.setTokenLoginInfo({ signature, address });
    }

    const loginActionData = { address, loginMethod: LoginMethodsEnum.ledger };
    useAccountStore().setLogin(loginActionData);

    optionalRedirect({
      callbackRoute,
      onLoginRedirect,
      options: { address, signature }
    });
  }

  const onLoginFailed = (err: any, customMessage = '') => {
    const { errorMessage } = getLedgerErrorCodes(err);

    if (errorMessage) {
      ledgerStore.setError(`${errorMessage}.${customMessage}`);
    }
    ledgerStore.setIsLoading(false);
    console.warn(err);
    useAccountStore().setLedgerAccount(null);
  };

  async function loginUser(hwWalletProvider: HWProvider) {
    if (ledgerStore.getSelectedAddress == null) {
      return false;
    }

    const index = ledgerStore.selectedAddress?.index
      ? ledgerStore.selectedAddress.index
      : 0;

    if (hasNativeAuth && !token) {
      token = await loginService.getNativeAuthLoginToken();
      // Fetching block failed
      if (!token) {
        console.warn('Fetching block failed. Login cancelled.');
        alert('Login cancelled. Please try again.');
        return;
      }
    }

    if (token) {
      loginService.setLoginToken(token);
      try {
        const loginInfo = await hwWalletProvider.tokenLogin({
          token: Buffer.from(`${token}{}`),
          addressIndex: index
        });
        dispatchLoginActions({
          address: loginInfo.address,
          provider: hwWalletProvider,
          index: index,
          signature: loginInfo.signature.toString('hex')
        });
      } catch (err) {
        onLoginFailed(err, '. Update MultiversX App to continue.');
      }
    } else {
      try {
        const address = await hwWalletProvider.login({ addressIndex: index });
        dispatchLoginActions({
          address,
          provider: hwWalletProvider,
          index
        });
      } catch (err) {
        onLoginFailed(err);
        return false;
      }
    }
    return true;
  }

  async function onConfirmSelectedAddress() {
    try {
      ledgerStore.setIsLoading(true);
      if (ledgerStore.selectedAddress == null) {
        return false;
      }
      if (ledgerAccount) {
        useAccountStore().updateLedgerAccount(ledgerStore.selectedAddress);
      } else {
        useAccountStore().setLedgerAccount({
          ...ledgerStore.selectedAddress,
          version: ledgerStore.getVersion,
          hasContractDataEnabled: ledgerStore.getContractDataEnabled
        });
      }

      const hwWalletProvider = new HWProvider();
      const initialized = await hwWalletProvider.init();
      if (!initialized) {
        ledgerStore.setError(failInitializeErrorText);
        console.warn(failInitializeErrorText);

        return false;
      }

      ledgerStore.setIsLoading(false);

      await loginUser(hwWalletProvider);
    } catch (err) {
      const { errorMessage } = getLedgerErrorCodes(err);
      if (errorMessage) {
        ledgerStore.setError(errorMessage);
      }
      console.warn(failInitializeErrorText, err);
    } finally {
      ledgerStore.setIsLoading(false);
    }
    ledgerStore.setShowAddressList(false);

    return true;
  }

  async function fetchAccounts() {
    try {
      ledgerStore.setIsLoadingAccounts(true);
      ledgerStore.setShowAddressList(true);
      const initialized = await hwWalletP.init();
      if (!initialized) {
        ledgerStore.setError(failInitializeErrorText);
        console.warn(failInitializeErrorText);
        ledgerStore.setIsLoadingAccounts(false);

        return;
      }
      const accountsVal = await hwWalletP.getAccounts(
        ledgerStore.getStartIndex,
        addressesPerPage
      );
      const ledgerData = await getLedgerConfiguration(hwWalletP);
      ledgerStore.setVersion(ledgerData.version);
      ledgerStore.setContractDataEnabled(ledgerData.dataEnabled);
      ledgerStore.setAccounts(accountsVal);

      ledgerStore.setIsLoadingAccounts(false);
    } catch (err) {
      const { errorMessage, defaultErrorMessage } = getLedgerErrorCodes(err);
      ledgerStore.setError(errorMessage ?? defaultErrorMessage);
      ledgerStore.setIsLoadingAccounts(false);
    }
  }

  async function onStartLogin() {
    if (isLoggedIn) {
      throw new Error(SECOND_LOGIN_ATTEMPT_ERROR);
    }
    ledgerStore.setError('');
    try {
      ledgerStore.setIsLoading(true);
      if (ledgerAccount != null) {
        const hwWalletP = new HWProvider();
        const initialized = await hwWalletP.init();
        if (!initialized || !ledgerStore.getSelectedAddress) {
          console.warn(failInitializeErrorText);
          return;
        }

        const address = await hwWalletP.login({
          addressIndex: ledgerStore.getSelectedAddress.index.valueOf()
        });
        setAccountProvider(hwWalletP);

        if (!address) {
          ledgerStore.setIsLoading(false);
          console.warn('Login cancelled.');
          return;
        }

        const loginActionData = { address, loginMethod: LoginMethodsEnum.ledger };
        useAccountStore().setLogin(loginActionData);

        optionalRedirect({
          callbackRoute,
          onLoginRedirect
        });
      } else {
        if (ledgerStore.getAccounts?.length > 0) {
          ledgerStore.setShowAddressList(true);
        } else {
          await fetchAccounts();
          ledgerStore.setShowAddressList(true);
        }
      }
    } catch (err) {
      console.error('error ', err);
      const { defaultErrorMessage } = getLedgerErrorCodes();
      ledgerStore.setError(defaultErrorMessage);
    } finally {
      ledgerStore.setIsLoading(false);
    }
  }

  const { startIndex, selectedAddress } = storeToRefs(useLedgerStore());

  watch(startIndex, () => {
    fetchAccounts();
  });

  watch(selectedAddress, () => {
    onConfirmSelectedAddress();
  });

  return [
    onStartLogin,
    onConfirmSelectedAddress
  ];
}
