import { MessageBridge as MessageBridgeContract } from '@gitmyabi/axlabs--bridge-evm-contracts/contracts';
import type { Address } from 'viem';
import type { ContractWrapperConfig, } from '../types/interfaces.js';
import { BridgeContractBase } from '../utils/bridge-base.js';

/**
 * MessageBridge type alias that represents the message bridge contract interface.
 * This contract handles cross-chain message passing, enabling communication and
 * data transfer between different blockchain networks without transferring tokens.
 */
export type MessageBridge = MessageBridgeContract;

/**
 * Factory class for creating MessageBridge contract instances.
 *
 * This factory follows the same pattern as other bridge contracts for consistency,
 * even though MessageBridge doesn't require proxy composition like NativeBridge or TokenBridge.
 * The factory pattern ensures a uniform interface across all bridge contracts and allows for
 * future extensibility without breaking existing implementations.
 *
 * The MessageBridge contract is responsible for:
 * - Sending arbitrary messages across blockchain networks which can be executable or not
 * - Supporting generic data payloads for cross-chain communication
 */
export class MessageBridgeFactory extends MessageBridgeContract {
  /**
   * Private constructor to enforce factory pattern usage.
   * Initializes the MessageBridge contract instance with proper Viem client configuration.
   *
   * @param config - Contract wrapper configuration containing address, RPC endpoints, and wallet info
   */
  private constructor(config: ContractWrapperConfig) {
    const clientsConfig = BridgeContractBase.createViemContractClientsConfig(config);
    super(config.contractAddress as Address, clientsConfig);
  }

  /**
   * Factory method that creates and returns a MessageBridge contract instance.
   *
   * This method is used for consistency with other bridge contract factories, particularly
   * NativeBridge and TokenBridge which require complex proxy composition. Using the same
   * creation pattern across all contracts provides a uniform developer experience.
   *
   * @param config - The contract wrapper configuration containing address and client settings
   * @returns A fully configured MessageBridge contract instance ready for cross-chain messaging
   */
  static create(config: ContractWrapperConfig): MessageBridge {
    return new MessageBridgeFactory(config);
  }
}
