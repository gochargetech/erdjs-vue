import {
  TransactionActionCategoryEnum,
  TransactionActionsEnum,
  type ServerTransactionType
} from 'erdjs-vue/types/serverTransactions.types';

export const getTransactionMethod = (transaction: ServerTransactionType) => {
  let transactionAction = 'Transaction';
  const transactionHasAction =
    transaction.action?.name && transaction.action?.category;

  if (transactionHasAction) {
    if (
      transaction.action?.category === TransactionActionCategoryEnum.esdtNft &&
      transaction.action?.name === TransactionActionsEnum.transfer
    ) {
      transactionAction = 'Transaction';
    } else if (transaction.action) {
      transactionAction = transaction.action.name;
    }

    if (transaction.action?.arguments?.functionName) {
      transactionAction = transaction.action.arguments.functionName;
    }
  }

  return transactionAction;
};
