import { defineStore } from 'pinia'
import { TRANSACTION_STATUS_TOAST_ID } from 'erdjs-vue/constants/transactionStatus';
import { ToastsEnum } from 'erdjs-vue/types';
import { getUnixTimestamp } from 'erdjs-vue/utils/dateTime/getUnixTimestamp';
import type {
  CustomToastType,
  FailTransactionToastType,
  TransactionToastType
} from 'erdjs-vue/types/toasts.types';

export interface ToastsSliceState {
  customToasts: CustomToastType[];
  transactionToasts: TransactionToastType[];
  failTransactionToast: FailTransactionToastType | null;
}

const initialState: ToastsSliceState = {
  customToasts: [],
  transactionToasts: [],
  failTransactionToast: null
};

export const useToastsStore = defineStore('erdjs-toasts', {
  state: () => {
    return { ...initialState }
  },
  persist: true,
  getters: {
    getCustomToasts: (state) => {
      return state.customToasts;
    },
    getTransactionToasts: (state) => {
      return state.transactionToasts;
    },
    getFailTransactionToast: (state) => {
      return state.failTransactionToast;
    },
  },
  actions: {
    addCustomToast(payload: CustomToastType) {
      this.customToasts.push({
        ...payload,
        type: ToastsEnum.custom,
        toastId:
          payload.toastId ||
          `custom-toast-${this.customToasts.length + 1}`
      });
    },
    removeCustomToast(payload: string) {
      this.customToasts = this.customToasts.filter(
        (toast) => toast.toastId !== payload
      );
    },
    addTransactionToast(payload: string) {
      this.transactionToasts.push({
        type: ToastsEnum.transaction,
        startTimestamp: getUnixTimestamp(),
        toastId:
          payload || `custom-toast-${this.transactionToasts.length + 1}`
      });
    },
    removeTransactionToast(payload: string) {
      this.transactionToasts = this.transactionToasts.filter((toast) => {
        return toast.toastId !== payload;
      });
    },
    addFailTransactionToast(payload: FailTransactionToastType) {
      this.failTransactionToast = {
        ...payload,
        toastId: TRANSACTION_STATUS_TOAST_ID
      };
    },
    removeFailTransactionToast() {
      this.failTransactionToast = null;
    },
  },
})