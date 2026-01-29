// Prefixed exports (for external usage to avoid naming conflicts)
export { MessageBridge as EvmMessageBridge } from './contracts/message-bridge.js';
export { ExecutionManager as EvmExecutionManager } from './contracts/execution-manager.js';
export { BridgeManagement as EvmBridgeManagement } from './contracts/bridge-management.js';
export { NativeBridge as EvmNativeBridge } from './contracts/native-bridge.js';
export { TokenBridge as EvmTokenBridge } from './contracts/token-bridge.js';

export type {
  ContractWrapperConfig as EvmContractWrapperConfig,
} from './types/interfaces.js';

