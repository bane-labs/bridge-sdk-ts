// Prefixed exports (for external usage to avoid naming conflicts)
export { AbstractContract as NeoAbstractContract } from './contracts/abstract-contract.js';
export { MessageBridge as NeoMessageBridge } from './contracts/message-bridge.js';
export { ExecutionManager as NeoExecutionManager } from './contracts/execution-manager.js';
export { BridgeManagement as NeoBridgeManagement } from './contracts/bridge-management.js';
export { NativeBridge as NeoNativeBridge } from './contracts/native-bridge.js';
export { TokenBridge as NeoTokenBridge } from './contracts/token-bridge.js';

export {
  GenericError as NeoGenericError,
  ContractInvocationError as NeoContractInvocationError,
  InsufficientFundsError as NeoInsufficientFundsError,
  InvalidParameterError as NeoInvalidParameterError,
} from './types/errors.js';

export type {
  TransactionResult as NeoTransactionResult,
  SendExecutableMessageParams as NeoSendExecutableMessageParams,
  SendResultMessageParams as NeoSendResultMessageParams,
  SendStoreOnlyMessageParams as NeoSendStoreOnlyMessageParams,
  ContractWrapperConfig as NeoContractWrapperConfig,
  State as NeoState,
  MessageBridgeConfigData as NeoMessageBridgeConfigData,
  MessageBridgeData as NeoMessageBridgeData,
  NeoMessage,
  NeoMetadata,
  NeoMetadataExecutable,
  NeoMetadataStoreOnly,
  NeoMetadataResult,
  NeoMetadataUnion,
  ExecutableState as NeoExecutableState,
  Account as NeoAccount,
  AssetBalance as NeoAssetBalance,
  BalanceResponse as NeoBalanceResponse
} from './types/interfaces.js';

// Neo utilities (no conflicts expected)
export * from './n3/neo-utils.js';
export * from './n3/neon-adapter.js';
export * from './n3/rpc-utils.js';
export * from './wallet/wallet.js';

