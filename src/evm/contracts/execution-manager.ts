import { ExecutionManager_abi_ccccac79_json } from '@gitmyabi/bane-labs--bridge-evm-contracts/contracts';
import type { Address } from 'viem';
import type { ContractWrapperConfig } from '../types/interfaces.js';
import { BridgeContractBase } from '../utils/bridge-base.js';

export type ExecutionManager = ExecutionManager_abi_ccccac79_json;

export class ExecutionManagerFactory extends ExecutionManager_abi_ccccac79_json {
  private constructor(config: ContractWrapperConfig) {
    const contractConfig = BridgeContractBase.createContractConfig(config);
    super(config.contractAddress as Address, contractConfig);
  }

  static create(config: ContractWrapperConfig): ExecutionManager {
    return new ExecutionManagerFactory(config);
  }
}
