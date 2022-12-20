import { defineStore } from 'pinia'
import type { NotificationTypesEnum } from 'erdjs-vue/types/enums.types';

export interface TxSubmittedModal {
  sessionId: string;
  submittedMessage: string;
}

export interface NotificationModal {
  type: NotificationTypesEnum;
  title: string;
  description: string;
}

export interface ModalsSliceState {
  txSubmittedModal?: TxSubmittedModal | null;
  notificationModal?: NotificationModal | null;
}

const initialState: ModalsSliceState = {
  txSubmittedModal: null,
  notificationModal: null,
};

export const useNotificationsStore = defineStore('erdjs-notifications', {
  state: () => {
    return { ...initialState }
  },
  persist: false,
  getters: {
    getNotificationModal: (state) => {
      return state.notificationModal;
    },
  },
  actions: {
    addNotification(payload: NotificationModal) {
      this.notificationModal = payload;
    },
  },
})