import { ExecutionManager_abi_ccccac79_json } from '@gitmyabi/bane-labs--bridge-evm-contracts/contracts';
import type { Address } from 'viem';
import type { ContractWrapperConfig } from '../types/interfaces.js';
import { BridgeContractBase } from '../utils/bridge-base.js';

export class ExecutionManager extends ExecutionManager_abi_ccccac79_json {
  constructor(config: ContractWrapperConfig) {
    const contractConfig = BridgeContractBase.createContractConfig(config);
    super(config.contractAddress as Address, contractConfig);
  }
}
