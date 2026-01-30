import { ExecutionManager as ExecutionManagerContract } from '@gitmyabi/bane-labs--bridge-evm-contracts/contracts';
import type { Address } from 'viem';
import type { ContractWrapperConfig } from '../types/interfaces.js';
import { BridgeContractBase } from '../utils/bridge-base.js';

export type ExecutionManager = ExecutionManagerContract;

export class ExecutionManagerFactory extends ExecutionManagerContract {
  private constructor(config: ContractWrapperConfig) {
    const contractConfig = BridgeContractBase.createContractConfig(config);
    super(config.contractAddress as Address, contractConfig);
  }

  static create(config: ContractWrapperConfig): ExecutionManager {
    return new ExecutionManagerFactory(config);
  }
}
