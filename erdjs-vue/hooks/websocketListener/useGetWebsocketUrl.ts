import { ref, watchEffect } from 'vue';

import { getWebsocketUrl } from 'erdjs-vue/utils/websocket/getWebsocketUrl';

export function useGetWebsocketUrl(apiAddress: string) {
  const url = ref<string>();
  const error = ref<unknown>();

  async function getUrl() {
    try {
      const fetchedUrl = await getWebsocketUrl(apiAddress);
      url.value = fetchedUrl;
    } catch (err) {
      error.value = err;
    }
  }

  watchEffect(() => {
    getUrl();
  });

  return { data: url, error, getUrl };
}
