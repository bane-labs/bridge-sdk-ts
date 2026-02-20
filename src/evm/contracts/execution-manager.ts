import { ExecutionManager as ExecutionManagerContract } from '@gitmyabi/axlabs--bridge-evm-contracts/contracts';
import type { Address } from 'viem';
import type { ContractWrapperConfig } from '../types/interfaces.js';
import { BridgeContractBase } from '../utils/bridge-base.js';

/**
 * ExecutionManager type alias that represents the execution management contract interface.
 * This contract handles the execution of cross-chain operations, managing transaction
 * processing, validation, and state transitions across different blockchain networks.
 */
export type ExecutionManager = ExecutionManagerContract;

/**
 * Factory class for creating ExecutionManager contract instances.
 *
 * This factory follows the same pattern as other bridge contracts for consistency,
 * even though ExecutionManager doesn't require proxy composition like NativeBridge or TokenBridge.
 * The factory pattern ensures a uniform interface across all bridge contracts and allows for
 * future extensibility without breaking existing implementations.
 *
 * The ExecutionManager contract is responsible for:
 * - Processing and validating cross-chain transactions
 * - Managing execution state and transaction lifecycle
 * - Coordinating with other bridge components for transaction completion
 * - Handling execution failures and retry mechanisms
 * - Maintaining execution history and audit trails
 */
export class ExecutionManagerFactory extends ExecutionManagerContract {
  /**
   * Private constructor to enforce factory pattern usage.
   * Initializes the ExecutionManager contract instance with proper Viem client configuration.
   *
   * @param config - Contract wrapper configuration containing address, RPC endpoints, and wallet info
   */
  private constructor(config: ContractWrapperConfig) {
    const clientsConfig = BridgeContractBase.createViemContractClientsConfig(config);
    super(config.contractAddress as Address, clientsConfig);
  }

  /**
   * Factory method that creates and returns an ExecutionManager contract instance.
   *
   * This method is used for consistency with other bridge contract factories, particularly
   * NativeBridge and TokenBridge which require complex proxy composition. Using the same
   * creation pattern across all contracts provides a uniform developer experience.
   *
   * @param config - The contract wrapper configuration containing address and client settings
   * @returns A fully configured ExecutionManager contract instance ready for transaction execution
   */
  static create(config: ContractWrapperConfig): ExecutionManager {
    return new ExecutionManagerFactory(config);
  }
}
