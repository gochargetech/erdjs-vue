import {
  useSignTransactionsWithDevice,
  type UseSignTransactionsWithDevicePropsType,
  type UseSignTransactionsWithDeviceReturnType
} from './useSignTransactionsWithDevice';

export function useSignTransactionsWithLedger(
  props: UseSignTransactionsWithDevicePropsType
): UseSignTransactionsWithDeviceReturnType {
  return useSignTransactionsWithDevice(props);
}
