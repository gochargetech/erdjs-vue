import type { TokenArgumentType } from 'erdjs-vue/types/serverTransactions.types';
import type {
  EgldValueDataType,
  NFTValueDataType,
  TokenValueDataType
} from 'erdjs-vue/utils/transactions/getInterpretedTransaction/helpers/types';
import { getTransactionActionNftText } from 'erdjs-vue/utils/transactions/transactionInfoHelpers/getTransactionActionNftText';
import { getTransactionActionTokenText } from 'erdjs-vue/utils/transactions/transactionInfoHelpers/getTransactionActionTokenText';
import { getIdentifierType } from 'erdjs-vue/utils/validation/getIdentifierType';

export interface GetTransactionValueReturnType {
  egldValueData?: EgldValueDataType;
  tokenValueData?: TokenValueDataType;
  nftValueData?: NFTValueDataType;
}

export const getTitleText = (
  transactionTokens: TokenArgumentType[]
): string => {
  const tokensArray = transactionTokens.map((transactionToken) => {
    const { isNft } = getIdentifierType(transactionToken.type);
    if (isNft) {
      const {
        badgeText,
        tokenFormattedAmount,
        tokenLinkText
      } = getTransactionActionNftText({
        token: transactionToken
      });

      const badge = badgeText != null ? `(${badgeText}) ` : '';

      const value = `${badge}${tokenFormattedAmount} ${tokenLinkText}`;
      return value;
    }
    const {
      tokenFormattedAmount,
      tokenLinkText,
      token
    } = getTransactionActionTokenText({
      token: transactionToken as TokenArgumentType
    });

    const identifier = token.collection ? token.identifier : token.token;

    const value = `${tokenFormattedAmount} ${tokenLinkText} (${identifier})`;
    return value;
  });

  const joinedTokensWithLineBreak = decodeURI(tokensArray.join('%0A'));
  return joinedTokensWithLineBreak;
};
