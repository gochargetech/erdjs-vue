import { fallbackNetworkConfigurations } from 'erdjs-vue/constants/network';
import type { EnvironmentsEnum, NetworkType } from 'erdjs-vue/types';
import { getServerConfiguration } from 'erdjs-vue/apiCalls/configuration/getServerConfiguration';

export interface GetServerConfigurationForEnvironmentOptionsType {
  apiAddress?: string;
}

export async function getServerConfigurationForEnvironment(
  environment: EnvironmentsEnum,
  options?: GetServerConfigurationForEnvironmentOptionsType
): Promise<NetworkType> {
  const fallbackConfig = fallbackNetworkConfigurations[environment];
  const serverApiAddress = options?.apiAddress ?? fallbackConfig.apiAddress;
  const config = await getServerConfiguration(serverApiAddress);

  return config !== null ? config : fallbackConfig;
}
