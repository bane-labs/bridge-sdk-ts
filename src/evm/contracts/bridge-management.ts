import { BridgeManagementImpl as BridgeManagementContract } from '@gitmyabi/axlabs--bridge-evm-contracts/contracts';
import type { Address } from 'viem';
import type {
  ContractWrapperConfig,
} from '../types/interfaces.js';
import { BridgeContractBase } from '../utils/bridge-base.js';

/**
 * BridgeManagement type alias that represents the bridge management contract interface.
 * This contract handles administrative operations for the bridge system, including
 * configuration management, access control, and system parameters.
 */
export type BridgeManagement = BridgeManagementContract;

/**
 * Factory class for creating BridgeManagement contract instances.
 *
 * This factory follows the same pattern as other complex bridge contracts for consistency,
 * even though BridgeManagement doesn't require proxy composition like NativeBridge or TokenBridge.
 * The factory pattern provides a uniform interface across all bridge contracts and allows for
 * future extensibility without breaking changes.
 *
 * The BridgeManagement contract is responsible for:
 * - Managing bridge operators and validators
 * - Setting bridge configuration parameters
 * - Controlling access permissions
 * - Managing bridge state and operational status
 */
export class BridgeManagementFactory extends BridgeManagementContract {
  /**
   * Private constructor to enforce factory pattern usage.
   * Initializes the BridgeManagement contract instance with proper Viem client configuration.
   *
   * @param config - Contract wrapper configuration containing address, RPC endpoints, and wallet info
   */
  private constructor(config: ContractWrapperConfig) {
    const clientsConfig = BridgeContractBase.createViemContractClientsConfig(config);
    super(config.contractAddress as Address, clientsConfig);
  }

  /**
   * Factory method that creates and returns a BridgeManagement contract instance.
   *
   * This method is used for consistency with other bridge contract factories, particularly
   * NativeBridge and TokenBridge which require complex proxy composition. Using the same
   * creation pattern across all contracts provides a uniform developer experience.
   *
   * @param config - The contract wrapper configuration containing address and client settings
   * @returns A fully configured BridgeManagement contract instance ready for use
   */
  static create(config: ContractWrapperConfig): BridgeManagement {
    return new BridgeManagementFactory(config);
  }
}
