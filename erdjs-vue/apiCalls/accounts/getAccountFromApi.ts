import axios from 'axios';
import { ACCOUNTS_ENDPOINT } from 'erdjs-vue/apiCalls/endpoints';
import { getCleanApiAddress } from 'erdjs-vue/apiCalls/utils';
import type { AccountType } from 'erdjs-vue/types';
import { useAppConfigStore } from 'erdjs-vue/store/erdjsAppConfig';

export async function getAccountFromApi(address?: string) {
  if (!address) {
    return null;
  }

  const withGuardianInfo = useAppConfigStore().getWithGuardianInfo;

  const apiAddress = getCleanApiAddress();
  const configUrl = `${apiAddress}/${ACCOUNTS_ENDPOINT}/${address}?withGuardianInfo=${withGuardianInfo}`;

  try {
    const { data } = await axios.get<AccountType>(configUrl);
    return data;
  } catch (err) {
    console.error('error fetching configuration for ', configUrl);
  }
  return null;
}
