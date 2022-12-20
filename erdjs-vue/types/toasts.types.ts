import type { ServerTransactionType } from './serverTransactions.types';

interface SharedCustomToast {
  toastId: string;
  /**
   * Duration in miliseconds
   */
  duration?: number;
  type?: string;
}
export interface MessageCustomToastType extends SharedCustomToast {
  message: string;
  icon?: never;
  iconClassName?: never;
  title?: never;
  status?: never;
  transaction?: never;
  component?: never;
}
interface SharedIconToastType extends SharedCustomToast {
  icon: string;
  iconClassName?: string;
  title: string;
}
export interface MessageIconToastType extends SharedIconToastType {
  message: string;
  /**
   * Use `status` to display a row of information between `title` and `message`
   */
  status?: string;
  transaction?: never;
  component?: never;
}

export interface TransactionIconToastType extends SharedIconToastType {
  transaction: ServerTransactionType;
  component?: never;
  message?: never;
  status?: never;
}

export interface ComponentIconToastType extends SharedIconToastType {
  /**
   * Use `component` to display a custom React compnent
   *
   * **⚠️ Warning**: Toasts with components will not be persisted on page reload because React components are not serializable
   */
  component: (() => JSX.Element) | null;
  transaction?: never;
  message?: never;
  status?: never;
}

export type CustomToastType =
  | MessageCustomToastType
  | MessageIconToastType
  | ComponentIconToastType
  | TransactionIconToastType;

export interface TransactionToastType {
  toastId: string;
  startTimestamp: number;
  type: string;
}

export interface FailTransactionToastType {
  toastId?: string;
  message: string;
  duration?: number;
}
