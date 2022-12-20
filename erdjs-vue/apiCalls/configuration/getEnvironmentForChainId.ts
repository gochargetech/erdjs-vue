import { chainIdToEnvironment } from 'erdjs-vue/constants/network';

export function getEnvironmentForChainId(chainId: string) {
  return chainIdToEnvironment[chainId];
}
