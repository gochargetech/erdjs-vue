import { useAccountStore } from 'erdjs-vue/store/erdjsAccountInfo';

// this is is needed to allow the users to set the nonce dynamically from outside the library
// without getting access to store.dispatch function
export function setNonce(nonce: number) {
  useAccountStore().setAccountNonce(nonce);
}
