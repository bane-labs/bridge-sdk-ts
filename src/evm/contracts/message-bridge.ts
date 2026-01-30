import { MessageBridge as MessageBridgeContract, AMBStorage} from '@gitmyabi/bane-labs--bridge-evm-contracts/contracts';
import type { Address } from 'viem';
import type {
  ContractWrapperConfig,
} from '../types/interfaces.js';
import { BridgeContractBase } from '../utils/bridge-base.js';
import { createComposedProxy } from '../utils/proxy-factory.js';

// Create a combined type that includes all properties from MessageBridge and only non-conflicting properties from AMBStorage
export type MessageBridge = MessageBridgeContract & Omit<AMBStorage, keyof MessageBridgeContract>;

export class MessageBridgeFactory extends MessageBridgeContract {
  private readonly ambStorage: AMBStorage;

  private constructor(config: ContractWrapperConfig) {
    const contractConfig = BridgeContractBase.createContractConfig(config);
    super(config.contractAddress as Address, contractConfig);

    this.ambStorage = BridgeContractBase.createContractInstance(
        AMBStorage,
      config
    );
  }

  // Create a factory method that returns the proxied instance
  static create(config: ContractWrapperConfig): MessageBridge {
    const instance = new MessageBridgeFactory(config);

    // Use the utility function for proxy creation
    return createComposedProxy(
      instance,
      [instance.ambStorage] as const
    );
  }

  // Access to the composed instance if needed
  getAMBStorageContract() {
    return this.ambStorage;
  }
}
