// Last synced with @elrondnetwork/dapp-core version 2.1.16
// 2022-11-30

import type { AssetType, ScamInfoType } from './account.types';
import type { EsdtEnumType, NftEnumType } from './tokens.types';

//#region server trasactions
export interface ScResultType {
  callType: string;
  gasLimit: number;
  gasPrice: number;
  nonce: number;
  prevTxHash: string;
  hash: string;
  originalTxHash: string;
  receiver: string;
  sender: string;
  timestamp: number;
  value: string;
  data?: string;
  returnMessage?: string;
}

export interface TransactionTokensType {
  esdts: string[];
  nfts: string[];
}

export enum TransactionActionsEnum {
  // esdtNft category
  transfer = 'transfer',
  // legacy delegation
  unBond = 'unBond',
  unStake = 'unStake',
  // stake category
  delegate = 'delegate',
  stake = 'stake',
  unDelegate = 'unDelegate',
  stakeClaimRewards = 'claimRewards',
  reDelegateRewards = 'reDelegateRewards',
  withdraw = 'withdraw',
  // mex category
  claimLockedAssets = 'claimLockedAssets',
  swapTokensFixedInput = 'swapTokensFixedInput',
  swapTokensFixedOutput = 'swapTokensFixedOutput',
  swap = 'swap',
  addLiquidity = 'addLiquidity',
  addLiquidityProxy = 'addLiquidityProxy',
  removeLiquidity = 'removeLiquidity',
  removeLiquidityProxy = 'removeLiquidityProxy',
  enterFarm = 'enterFarm',
  enterFarmProxy = 'enterFarmProxy',
  enterFarmAndLockRewards = 'enterFarmAndLockRewards',
  enterFarmAndLockRewardsProxy = 'enterFarmAndLockRewardsProxy',
  exitFarm = 'exitFarm',
  exitFarmProxy = 'exitFarmProxy',
  claimRewards = 'claimRewards',
  claimRewardsProxy = 'claimRewardsProxy',
  compoundRewards = 'compoundRewards',
  compoundRewardsProxy = 'compoundRewardsProxy',
  wrapEgld = 'wrapEgld',
  unwrapEgld = 'unwrapEgld',
  unlockAssets = 'unlockAssets',
  mergeLockedAssetTokens = 'mergeLockedAssetTokens',
  stakeFarm = 'stakeFarm',
  stakeFarmProxy = 'stakeFarmProxy',
  stakeFarmTokens = 'stakeFarmTokens',
  stakeFarmTokensProxy = 'stakeFarmTokensProxy',
  unstakeFarm = 'unstakeFarm',
  unstakeFarmProxy = 'unstakeFarmProxy',
  unstakeFarmTokens = 'unstakeFarmTokens',
  unstakeFarmTokensProxy = 'unstakeFarmTokensProxy',
  claimDualYield = 'claimDualYield',
  claimDualYieldProxy = 'claimDualYieldProxy',
  unbondFarm = 'unbondFarm',
  ping = 'ping'
}

export enum TransactionActionCategoryEnum {
  esdtNft = 'esdtNft',
  mex = 'mex',
  stake = 'stake',
  scCall = 'scCall'
}

export interface TokenArgumentType {
  type: NftEnumType | EsdtEnumType;
  name: string;
  ticker: string;
  collection?: string;
  identifier?: string;
  token?: string;
  decimals: number;
  value: string;
  providerName?: string;
  providerAvatar?: string;
  svgUrl?: string;
}

export interface TransactionActionType {
  category: string;
  name: TransactionActionsEnum;
  description?: string;
  arguments?: { [key: string]: any };
}

export interface UnwrapperType {
  token?: TokenArgumentType[];
  tokenNoValue?: TokenArgumentType[];
  tokenNoLink?: TokenArgumentType[];
  address?: string;
  egldValue?: string;
  value?: string;
  providerName?: string;
  providerAvatar?: string;
}

export enum TransactionOperationActionTypeEnum {
  none = 'none',
  transfer = 'transfer',
  burn = 'burn',
  addQuantity = 'addQuantity',
  create = 'create',
  multiTransfer = 'multiTransfer',
  localMint = 'localMint',
  localBurn = 'localBurn',
  wipe = 'wipe',
  freeze = 'freeze',
  writeLog = 'writeLog',
  signalError = 'signalError',

  // to be deprecated ?
  ESDTLocalMint = 'ESDTLocalMint',
  ESDTLocalBurn = 'ESDTLocalBurn'
}

export enum VisibleTransactionOperationType {
  nft = 'nft',
  esdt = 'esdt',
  egld = 'egld'
}
export enum HiddenTransactionOperationType {
  none = 'none',
  error = 'error',
  log = 'log'
}

export interface OperationType {
  action: TransactionOperationActionTypeEnum;
  type: VisibleTransactionOperationType | HiddenTransactionOperationType;
  esdtType?: NftEnumType | EsdtEnumType;
  collection?: string;
  name?: string;
  identifier?: string;
  sender: string;
  receiver: string;
  value: string;
  decimals?: number;
  data?: string;
  message?: string;
  svgUrl?: string;
}

export interface LogType {
  hash: string;
  callType: string;
  gasLimit: number;
  gasPrice: number;
  nonce: number;
  prevTxHash: string;
  receiver?: string;
  sender: string;
  value: string;
  data?: string;
  originalTxHash: string;
  returnMessage?: string;
  logs?: any;
}

export interface EventType {
  address: string;
  identifier: string;
  topics: string[];
  order: number;
  data?: string;
}

export interface ResultLogType {
  id: string;
  address: string;
  events: EventType[];
}

export interface ResultType {
  hash: string;
  callType: string;
  gasLimit: number;
  gasPrice: number;
  nonce: number;
  prevTxHash: string;
  receiver?: string;
  sender: string;
  value: string;
  data?: string;
  originalTxHash: string;
  returnMessage?: string;
  logs?: ResultLogType;
  senderAssets?: AssetType;
  receiverAssets?: AssetType;
}

export interface ReceiptType {
  value: string;
  sender: string;
  data: string;
}

export interface ServerTransactionType {
  fee?: string;
  data: string;
  gasLimit: number;
  gasPrice: number;
  gasUsed: number;
  txHash: string;
  miniBlockHash: string;
  nonce: number;
  receiver: string;
  receiverShard: number;
  round: number;
  sender: string;
  senderShard: number;
  signature: string;
  status: string;
  timestamp: number;
  value: string;
  price: number;
  results?: ResultType[];
  operations?: OperationType[];
  action?: TransactionActionType;
  logs?: {
    id: string;
    address: string;
    events: EventType[];
  };
  scamInfo?: ScamInfoType;
  pendingResults?: boolean;
  receipt?: ReceiptType;
  senderAssets?: AssetType;
  receiverAssets?: AssetType;
  type?: TransferTypeEnum;
  originalTxHash?: string;
  isNew?: boolean; // UI flag
  tokenValue?: string;
  tokenIdentifier?: string;
}

export enum TransferTypeEnum {
  Transaction = 'Transaction',
  SmartContractResult = 'SmartContractResult'
}

//#endregion

//#region interpreted trasactions

export enum TransactionDirectionEnum {
  SELF = 'Self',
  INTERNAL = 'Internal',
  IN = 'In',
  OUT = 'Out'
}

export interface InterpretedTransactionType extends ServerTransactionType {
  transactionDetails: {
    direction?: TransactionDirectionEnum;
    method: string;
    transactionTokens: TokenArgumentType[];
    isContract?: boolean;
  };
  links: {
    senderLink?: string;
    receiverLink?: string;
    senderShardLink?: string;
    receiverShardLink?: string;
    transactionLink?: string;
  };
}

export enum DecodeMethodEnum {
  raw = 'raw',
  text = 'text',
  decimal = 'decimal',
  smart = 'smart'
}

//#endregion
