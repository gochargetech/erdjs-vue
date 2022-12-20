import axios from 'axios';
import { useDappStore } from 'erdjs-vue/store/erdjsDapp';
import type { ScamInfoType } from 'erdjs-vue/types/account.types';
import { ACCOUNTS_ENDPOINT } from './endpoints';

export async function getScamAddressData(addressToVerify: string) {
  const network = useDappStore().getNetworkConfig;
  const apiAddress = network.apiAddress
  const apiTimeout = network.apiTimeout;

  const { data } = await axios.get<{
    scamInfo?: ScamInfoType;
    code?: string;
  }>(`/${ACCOUNTS_ENDPOINT}/${addressToVerify}`, {
    baseURL: apiAddress,
    timeout: Number(apiTimeout)
  });

  return data;
}
