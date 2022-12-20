import axios from 'axios';
import { NETWORK_CONFIG_ENDPOINT } from 'erdjs-vue/apiCalls/endpoints';
import { getCleanApiAddress } from 'erdjs-vue/apiCalls/utils';
import type { ApiNetworkConfigType } from 'erdjs-vue/types';

export async function getNetworkConfigFromApi() {
  const apiAddress = getCleanApiAddress();

  const configUrl = `${apiAddress}/${NETWORK_CONFIG_ENDPOINT}`;

  try {
    const { data } = await axios.get<{
      data: { config: ApiNetworkConfigType };
    }>(configUrl);
    if (data != null) {
      return data?.data?.config;
    }
  } catch (err) {
    console.error('error fetching configuration for ', configUrl);
  }
  return null;
}
