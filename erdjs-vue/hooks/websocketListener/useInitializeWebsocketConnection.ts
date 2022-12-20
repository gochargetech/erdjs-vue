import { ref, watch, watchEffect } from 'vue';
import { io } from 'socket.io-client';
import { useGetAccount } from 'erdjs-vue/hooks/account/useGetAccount';
import { useAccountStore } from 'erdjs-vue/store/erdjsAccountInfo';
import { retryMultipleTimes } from 'erdjs-vue/utils/retryMultipleTimes';
import { getWebsocketUrl } from 'erdjs-vue/utils/websocket/getWebsocketUrl';
import { useGetNetworkConfig } from 'erdjs-vue/hooks/useGetNetworkConfig';
import {
  websocketConnection,
  WebsocketConnectionStatusEnum
} from './websocketConnection';

const TIMEOUT = 3000;
const RECONNECTION_ATTEMPTS = 3;
const RETRY_INTERVAL = 500;
const MESSAGE_DELAY = 1000;

export function useInitializeWebsocketConnection() {
  const timeout = ref<NodeJS.Timeout | null>(null);

  const { address } = useGetAccount();
  const addressRef = ref(address);

  const network = useGetNetworkConfig();
  const websocketConnectionRef = ref(websocketConnection.current);

  const handleMessageReceived = (message: string) => {
    if (timeout.value) {
      clearTimeout(timeout.value);
    }
    timeout.value = setTimeout(() => {
      useAccountStore().setWebsocketEvent(message);
    }, MESSAGE_DELAY);
  };

  const initializeWebsocketConnection = watch(addressRef,
    retryMultipleTimes(
      async () => {
        // If there are many components that use this hook, the initialize method is triggered many times.
        // To avoid multiple connections to the same endpoint, we have to guard the initialization before the logic started
        websocketConnection.status = WebsocketConnectionStatusEnum.PENDING;

        const websocketUrl = await getWebsocketUrl(network.apiAddress);

        if (websocketUrl == null) {
          console.warn('Can not get websocket url');
          return;
        }

        websocketConnection.current = io(websocketUrl, {
          forceNew: true,
          reconnectionAttempts: RECONNECTION_ATTEMPTS,
          timeout: TIMEOUT,
          query: {
            address
          }
        });

        websocketConnection.status = WebsocketConnectionStatusEnum.COMPLETED;

        websocketConnection.current.onAny((message) => {
          handleMessageReceived(message);
        });
      },
      {
        retries: 2,
        delay: RETRY_INTERVAL
      }
    ),
    {
      immediate: true
    }
  );

  watch([addressRef, websocketConnectionRef], () => {
    if (
      address &&
      websocketConnection.status ===
      WebsocketConnectionStatusEnum.NOT_INITIALIZED &&
      !websocketConnection.current
    ) {
      initializeWebsocketConnection();
    }
  }, {
    immediate: true
  });

  watchEffect(() => {
    return () => {
      websocketConnection.current?.close();
      if (timeout.value) {
        clearTimeout(timeout.value);
      }
    };
  });
}
