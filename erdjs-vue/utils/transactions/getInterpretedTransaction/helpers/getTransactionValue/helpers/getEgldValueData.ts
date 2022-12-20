import { DECIMALS } from 'erdjs-vue/constants/index';
import { formatAmount } from 'erdjs-vue/utils/operations/formatAmount';

export const getEgldValueData = (value: string) => ({
  egldValueData: {
    value,
    formattedValue: formatAmount({ input: value }),
    decimals: DECIMALS
  }
});
