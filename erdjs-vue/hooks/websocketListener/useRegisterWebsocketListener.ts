import { ref, watch } from 'vue';
import { useAccountStore } from 'erdjs-vue/store/erdjsAccountInfo';
import { useInitializeWebsocketConnection } from './useInitializeWebsocketConnection';

export function useRegisterWebsocketListener(
  onMessage: (message: string) => void
) {
  useInitializeWebsocketConnection();

  const websocketEvent = useAccountStore().getWebsocketEvent;
  const websocketEventRef = ref(websocketEvent);

  watch([onMessage, websocketEventRef], () => {
    const message = websocketEventRef.value?.message;
    if (message) {
      onMessage(message);
    }
  }, {
    immediate: true
  });
}
