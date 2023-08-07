import { useSetLedgerProvider } from 'erdjs-vue/hooks/login/useSetLedgerProvider';
import { useGetAccountProvider } from 'erdjs-vue/hooks/account/useGetAccountProvider';

export const useGetLedgerProvider = () => {
  const { provider } = useGetAccountProvider();
  const { setLedgerProvider } = useSetLedgerProvider();

  return async function getLedgerProvider() {
    let isConnected: boolean;

    try {
      // Throwing ts check error because wallet connect doesn't have the getAddress method.
      // We can ignore it because this method is only called for ledger.
      // @ts-ignore
      const address = await provider.getAddress();
      isConnected = Boolean(address);
    } catch (error) {
      isConnected = false;
    }

    if (isConnected) {
      return provider;
    }

    const ledgerProvider = await setLedgerProvider({ isRelogin: true });

    if (!ledgerProvider) {
      return provider;
    }

    return ledgerProvider;
  };
};
