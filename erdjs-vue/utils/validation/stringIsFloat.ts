import BigNumber from 'bignumber.js';
import { ZERO } from 'erdjs-vue/constants/index';

export const stringIsFloat = (amount: string) => {
  if (isNaN(amount as any)) {
    return false;
  }
  if (String(amount).includes('Infinity')) {
    return false;
  }

  // eslint-disable-next-line
  let [wholes, decimals] = amount.split('.');
  if (decimals) {
    while (decimals.charAt(decimals.length - 1) === ZERO) {
      decimals = decimals.slice(0, -1);
    }
  }
  const number = decimals ? [wholes, decimals].join('.') : wholes;
  const bNparsed = new BigNumber(number);
  return bNparsed.toString(10) === number && bNparsed.comparedTo(0) >= 0;
};
