// TODO: implement correct gas cost calculation.
// @see https://gateway.elrond.com/network/gas-configs

export * from './errorsMessages';
export * from './network';
export * from './ledgerErrorCodes';
export * from './mnemonicWords';
export * from './transactionStatus';

export const GAS_PRICE_MODIFIER = 0.01;
export const GAS_PER_DATA_BYTE = 1_500;
export const GAS_LIMIT = 50_000;
export const GAS_PRICE = 1_000_000_000;
export const DECIMALS = 18;
export const DIGITS = 4;
export const VERSION = 1;

export const LEDGER_CONTRACT_DATA_ENABLED_VALUE = 1;

export const METACHAIN_SHARD_ID = 4294967295;
export const ALL_SHARDS_SHARD_ID = 4294967280;

export const DAPP_INIT_ROUTE = '/dapp/init';
export const WALLET_SIGN_SESSION = 'signSession';

export const LOGOUT_ACTION_NAME = 'logout';
export const LOGIN_ACTION_NAME = 'login';

export const CANCEL_ACTION_NAME = 'cancelSignTx';

export const REFUNDED_GAS = 'refundedGas';

/**
 * Not Applicable
 * @value N/A
 */
export const N_A = 'N/A';

export const ZERO = '0';
