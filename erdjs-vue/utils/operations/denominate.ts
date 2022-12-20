import { DECIMALS, DIGITS } from 'erdjs-vue/constants/index';
import { formatAmount } from './formatAmount';

let deprecationMessageDisplayed = false;

export interface DenominateType {
  input: string;
  denomination?: number;
  decimals?: number;
  showIsLessThanDecimalsLabel?: boolean;
  showLastNonZeroDecimal?: boolean;
  addCommas?: boolean;
}

/**
 * !!! This function is deprecated. Please use formatAmount instead.
 * */
export function denominate({
  input,
  denomination = DECIMALS,
  decimals = DIGITS,
  showLastNonZeroDecimal = true,
  showIsLessThanDecimalsLabel = false,
  addCommas = false
}: DenominateType) {
  if (!deprecationMessageDisplayed) {
    console.warn(
      '!!! Be aware !!! The "denominate" function is deprecated. Please use "formatAmount" instead.'
    );

    deprecationMessageDisplayed = true;
  }

  return formatAmount({
    input,
    decimals: denomination,
    addCommas,
    digits: decimals,
    showIsLessThanDecimalsLabel,
    showLastNonZeroDecimal
  });
}
