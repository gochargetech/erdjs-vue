import type {
  InitiateLoginFunctionType,
  LoginHookGenericStateType
} from 'erdjs-vue/types/login.types';
import { ref, reactive } from 'vue';

const defaultAddressesPerPage = 10;

export interface SelectedAddress {
  address: string;
  index: number;
}

export const emptySelectedAddress: SelectedAddress = {
  address: '',
  index: -1
}

export interface LedgerLoginHookCustomStateType {
  accounts: string[];
  showAddressList: boolean;
  startIndex: number;
  selectedAddress: SelectedAddress | null;
  onGoToPrevPage: () => void;
  onGoToNextPage: () => void;
  onSelectAddress: (address: SelectedAddress | null) => void;
  onConfirmSelectedAddress: () => void;
}

export type LedgerLoginHookReturnType = [
  InitiateLoginFunctionType,
  LoginHookGenericStateType,
  LedgerLoginHookCustomStateType
];

export const useAddressScreens = () => {
  const error = ref('');
  const isLoading = ref(false);

  const startIndex = ref(0);
  const accounts = reactive({ accounts: [] });

  const defaultSelectedAddress: SelectedAddress | null = emptySelectedAddress;
  const selectedAddress = reactive({ selected: defaultSelectedAddress });

  const showAddressList = ref(false);

  const onSelectAddress = (address: SelectedAddress | null) => {
    if (address) {
      selectedAddress.selected = address;
    }
  };

  const onGoToNextPage = () => {
    selectedAddress.selected = emptySelectedAddress;
    startIndex.value++;
  };

  const onGoToPrevPage = () => {
    selectedAddress.selected = emptySelectedAddress;
    startIndex.value = startIndex.value === 0 ? 0 : startIndex.value - 1;
  };

  return {
    accounts,
    isLoading,
    showAddressList,
    startIndex,
    selectedAddress,
    onGoToPrevPage,
    onGoToNextPage,
    onSelectAddress,
    error,
    defaultAddressesPerPage
  };
};
