import { getAccountFromApi } from 'erdjs-vue/apiCalls/accounts/getAccountFromApi';

export async function getAccount(address?: string) {
  return await getAccountFromApi(address);
}
