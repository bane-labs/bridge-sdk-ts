import { MessageBridge_abi_3a142650_json, AMBStorage_abi_da8cd343_json} from '@gitmyabi/bane-labs--bridge-evm-contracts/contracts';
import type { Address, PublicClient, WalletClient } from 'viem';
import type {
  ContractWrapperConfig,
} from '../types/interfaces.js';

export class MessageBridge extends MessageBridge_abi_3a142650_json {
  private readonly ambStorage: AMBStorage_abi_da8cd343_json;

  constructor(config: ContractWrapperConfig) {
    super(config.contractAddress as Address, {
      publicClient: config.publicClient as PublicClient,
      walletClient: config.walletClient as WalletClient,
    });

    this.ambStorage = new AMBStorage_abi_da8cd343_json(config.contractAddress as Address, {
      publicClient: config.publicClient as PublicClient,
      walletClient: config.walletClient as WalletClient,
    });

    // Create a proxy that automatically delegates methods to ambStorage
    return new Proxy(this, {
      get(target, prop, receiver) {
        // If the property exists on the target, use it
        if (prop in target) {
          return Reflect.get(target, prop, receiver);
        }

        // If the property exists on ambStorage and is a function, delegate to it
        if (prop in target.ambStorage && typeof (target.ambStorage as any)[prop] === 'function') {
          return (...args: any[]) => (target.ambStorage as any)[prop](...args);
        }

        return Reflect.get(target, prop, receiver);
      }
    });
  }

  // Access to the composed instance if needed
  getAMBStorageContract() {
    return this.ambStorage;
  }
}
