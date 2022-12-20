import { DECIMALS } from 'erdjs-vue/constants/index';
import { NftEnumType } from 'erdjs-vue/types/tokens.types';

import { getTransactionTokens } from 'erdjs-vue/utils/transactions/getInterpretedTransaction/helpers/getTransactionTokens';
import type {
  EgldValueDataType,
  NFTValueDataType,
  TokenValueDataType
} from 'erdjs-vue/utils/transactions/getInterpretedTransaction/helpers/types';
import { getTransactionActionNftText } from 'erdjs-vue/utils/transactions/transactionInfoHelpers/getTransactionActionNftText';
import { getTransactionActionTokenText } from 'erdjs-vue/utils/transactions/transactionInfoHelpers/getTransactionActionTokenText';

import {
  ACTIONS_WITH_EGLD_VALUE,
  ACTIONS_WITH_MANDATORY_OPERATIONS,
  ACTIONS_WITH_VALUE_IN_ACTION_FIELD,
  ACTIONS_WITH_VALUE_IN_DATA_FIELD
} from 'erdjs-vue/utils/transactions/getInterpretedTransaction/constants';

import {
  getValueFromActions,
  getValueFromDataField,
  getValueFromOperations
} from './helpers';
import { getEgldValueData } from './helpers/getEgldValueData';
import { getTitleText } from './helpers/getTitleText';
import type { InterpretedTransactionType } from 'erdjs-vue/types/serverTransactions.types';

export interface GetTransactionValueReturnType {
  egldValueData?: EgldValueDataType;
  tokenValueData?: TokenValueDataType;
  nftValueData?: NFTValueDataType;
}

export interface GetTransactionValueType {
  transaction: InterpretedTransactionType;
  hideMultipleBadge?: boolean;
}

export const getTransactionValue = ({
  transaction,
  hideMultipleBadge
}: GetTransactionValueType): GetTransactionValueReturnType => {
  if (transaction.action) {
    if (ACTIONS_WITH_EGLD_VALUE.includes(transaction.action.name)) {
      return getEgldValueData(transaction.value);
    }

    if (ACTIONS_WITH_VALUE_IN_DATA_FIELD.includes(transaction.action.name)) {
      return getValueFromDataField(transaction);
    }

    if (ACTIONS_WITH_MANDATORY_OPERATIONS.includes(transaction.action.name)) {
      return getValueFromOperations(transaction);
    }

    if (ACTIONS_WITH_VALUE_IN_ACTION_FIELD.includes(transaction.action.name)) {
      return getValueFromActions(transaction);
    }

    const transactionTokens = getTransactionTokens(transaction);

    if (transactionTokens.length) {
      const txToken = transactionTokens[0];
      const isNft = Object.values(NftEnumType).includes(
        txToken.type as NftEnumType
      );

      const hasTitleText = !hideMultipleBadge && transactionTokens.length > 1;
      const titleText = hasTitleText ? getTitleText(transactionTokens) : '';

      if (isNft) {
        const {
          badgeText,
          tokenFormattedAmount,
          tokenExplorerLink,
          tokenLinkText
        } = getTransactionActionNftText({ token: txToken });

        return {
          nftValueData: {
            badgeText,
            tokenFormattedAmount,
            tokenExplorerLink,
            tokenLinkText,
            transactionTokens,
            token: txToken,
            value: tokenFormattedAmount != null ? txToken.value : null,
            decimals: tokenFormattedAmount != null ? txToken.decimals : null,
            titleText
          }
        };
      }

      const {
        tokenExplorerLink,
        showFormattedAmount,
        tokenFormattedAmount,
        tokenLinkText,
        token
      } = getTransactionActionTokenText({
        token: txToken
      });

      return {
        tokenValueData: {
          tokenExplorerLink,
          showFormattedAmount,
          tokenFormattedAmount,
          tokenLinkText,
          transactionTokens,
          token,
          value: txToken.value,
          decimals: txToken.decimals ?? DECIMALS,
          titleText
        }
      };
    }
  }

  return getEgldValueData(transaction.value);
};
