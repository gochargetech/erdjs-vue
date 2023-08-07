import { HWProvider } from '@multiversx/sdk-hw-provider';
import { setAccountProvider } from 'erdjs-vue/providers/accountProvider';

import { getLedgerConfiguration } from 'erdjs-vue/providers/utils';
import { logout } from 'erdjs-vue/utils/logout';
import { useLoginInfoStore } from 'erdjs-vue/store/erdjsLoginInfo';
import { reactive } from 'vue';
import { storeToRefs } from 'pinia';

async function getHwWalletProvider(ledgerLoginIndex?: number) {
  const hwWalletP = new HWProvider();
  let isInitialized = hwWalletP.isInitialized();
  if (!isInitialized) {
    isInitialized = await hwWalletP.init();
  }

  if (!isInitialized) {
    return null;
  }

  if (ledgerLoginIndex != null) {
    await hwWalletP.setAddressIndex(ledgerLoginIndex);
  }

  return hwWalletP;
}

type SetLedgerProviderType = {
  isRelogin?: boolean;
};

export const useSetLedgerProvider = () => {
  // const logoutRoute = useSelector(logoutRouteSelector);
  // const isLoggedIn = useSelector(isLoggedInSelector);
  // const ledgerLogin = useSelector(ledgerLoginSelector);

  const { isLoggedIn, ledgerLogin, logoutRoute } = storeToRefs(useLoginInfoStore());

  const ledgerData = reactive({
    data: {
      version: '',
      dataEnabled: false
    }
  })

  async function setLedgerProvider(props?: SetLedgerProviderType) {
    let hwWalletP: HWProvider | null = null;

    const shouldLogout = isLoggedIn && !props?.isRelogin;

    try {
      // @ts-ignore
      hwWalletP = await getHwWalletProvider(ledgerLogin?.index);

      if (!hwWalletP) {
        console.warn('Could not initialise ledger app');

        if (shouldLogout) {
          // @ts-ignore
          logout(logoutRoute);
        }
        return;
      }

      const ledgerConfig = await getLedgerConfiguration(hwWalletP);
      setAccountProvider(hwWalletP);
      ledgerData.data = ledgerConfig;

      return hwWalletP;
    } catch (err) {
      console.error('Could not initialise ledger app', err);
      if (shouldLogout) {
        // @ts-ignore
        logout(logoutRoute);
      }
    }
    return null;
  }

  return {
    setLedgerProvider,
    ledgerData: ledgerData.data
  };
};
