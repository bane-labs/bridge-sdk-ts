// Factory exports (for those who prefer explicit factory naming) - same as above
export { MessageBridgeFactory as EvmMessageBridgeFactory } from './contracts/message-bridge.js';
export { NativeBridgeFactory as EvmNativeBridgeFactory } from './contracts/native-bridge.js';
export { TokenBridgeFactory as EvmTokenBridgeFactory } from './contracts/token-bridge.js';

// Export types as well for TypeScript users
export type { MessageBridge as EvmMessageBridge } from './contracts/message-bridge.js';
export type { NativeBridge as EvmNativeBridge } from './contracts/native-bridge.js';
export type { TokenBridge as EvmTokenBridge } from './contracts/token-bridge.js';

// Simple contract exports
export { ExecutionManager as EvmExecutionManager } from './contracts/execution-manager.js';
export { BridgeManagement as EvmBridgeManagement } from './contracts/bridge-management.js';

export type {
  ContractWrapperConfig as EvmContractWrapperConfig,
} from './types/interfaces.js';

