import { fallbackNetworkConfigurations } from 'erdjs-vue/constants/network';
import { getEnvironmentForChainId } from 'erdjs-vue/apiCalls/configuration/getEnvironmentForChainId';

export function getApiAddressForChainId(chainId: string) {
  const environment = getEnvironmentForChainId(chainId);
  const apiAddress = fallbackNetworkConfigurations[environment].apiAddress;
  if (!apiAddress) {
    throw 'Could not extract api address for environment, check if you have a valid chainID';
  }
  return apiAddress;
}
