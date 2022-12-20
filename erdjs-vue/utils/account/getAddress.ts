import { getAccountProvider } from 'erdjs-vue/providers';
import { useAccountStore } from 'erdjs-vue/store/erdjsAccountInfo';
import { LoginMethodsEnum } from 'erdjs-vue/types/enums.types';
import { getIsProviderEqualTo } from 'erdjs-vue/utils/account/getIsProviderEqualTo';
import { addressIsValid } from './addressIsValid';
import { getIsLoggedIn } from 'erdjs-vue/utils/getIsLoggedIn';

export function getAddress(): Promise<string> {
  const { search } = window.location;
  const accountStore = useAccountStore();
  const provider = getAccountProvider();
  const address = accountStore.getAddress;
  const loggedIn = getIsLoggedIn();

  if (!provider) {
    throw 'provider not initialized';
  }

  if (getIsProviderEqualTo(LoginMethodsEnum.ledger) && loggedIn) {
    return new Promise((resolve) => {
      resolve(address);
    });
  }

  return !getIsProviderEqualTo(LoginMethodsEnum.none) &&
    !getIsProviderEqualTo(LoginMethodsEnum.wallet) &&
    !getIsProviderEqualTo(LoginMethodsEnum.extra)
    ? // TODO: does not take into account ledger locked see link for details:
    // https://github.com/ElrondNetwork/dapp/blob/d5c57695a10055f20d387ba064b6843606789ee9/src/helpers/accountMethods.tsx#L21
    // @ts-ignore
    provider.getAddress()
    : new Promise((resolve) => {
      const urlSearchParams = new URLSearchParams(search);
      const params = Object.fromEntries(urlSearchParams as any);
      if (addressIsValid(params.address)) {
        resolve(params.address);
      }

      if (loggedIn) {
        resolve(address);
      }

      resolve('');
    });
}
