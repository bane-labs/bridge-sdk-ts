export { MessageBridgeFactory as EvmMessageBridgeFactory } from './contracts/message-bridge.js';
export { NativeBridgeFactory as EvmNativeBridgeFactory } from './contracts/native-bridge.js';
export { TokenBridgeFactory as EvmTokenBridgeFactory } from './contracts/token-bridge.js';
export { BridgeManagementFactory as EvmBridgeManagementFactory } from './contracts/bridge-management.js';
export { ExecutionManagerFactory as EvmExecutionManagerFactory } from './contracts/execution-manager.js';

export type { MessageBridge as EvmMessageBridge } from './contracts/message-bridge.js';
export type { NativeBridge as EvmNativeBridge } from './contracts/native-bridge.js';
export type { TokenBridge as EvmTokenBridge } from './contracts/token-bridge.js';
export type { BridgeManagement as EvmBridgeManagement } from './contracts/bridge-management.js';
export type { ExecutionManager as EvmExecutionManager } from './contracts/execution-manager.js';

export type {
  ContractWrapperConfig as EvmContractWrapperConfig,
} from './types/interfaces.js';
