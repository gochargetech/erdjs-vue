import { useGetNetworkConfig } from 'erdjs-vue/hooks/useGetNetworkConfig';
import { getExplorerLink } from './getExplorerLink';

export function getExplorerUrl(to: string): string {
  const networkConfig = useGetNetworkConfig();

  return getExplorerLink({
    explorerAddress: String(networkConfig.explorerAddress),
    to: to
  });
}
