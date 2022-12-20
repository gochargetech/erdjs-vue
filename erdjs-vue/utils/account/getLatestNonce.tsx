import { useAccountStore } from 'erdjs-vue/store/erdjsAccountInfo';
import type { AccountType } from 'erdjs-vue/types';

export function getLatestNonce(account: AccountType | null) {
  const currentAccountNonce = useAccountStore().getAccountNonce;
  if (!account) {
    return currentAccountNonce;
  }
  return currentAccountNonce && !isNaN(currentAccountNonce)
    ? Math.max(currentAccountNonce, account.nonce)
    : account.nonce;
}
