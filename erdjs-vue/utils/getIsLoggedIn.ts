import { useLoginInfoStore } from 'erdjs-vue/store/erdjsLoginInfo'

export function getIsLoggedIn() {
  const store = useLoginInfoStore();

  return Boolean(store.isLoggedIn);
}