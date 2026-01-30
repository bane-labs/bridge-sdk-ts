import { BridgeStorage, IBridge, INativeBridge } from '@gitmyabi/bane-labs--bridge-evm-contracts/contracts';
import type { Address } from 'viem';
import type { ContractWrapperConfig, } from '../types/interfaces.js';
import { BridgeContractBase } from '../utils/bridge-base.js';
import { createComposedProxy } from '../utils/proxy-factory.js';

/**
 * NativeBridge type that combines all properties from multiple contract interfaces.
 * This type represents a composed contract that includes all functionality from:
 * - IBridge: Core bridge interface with common methods
 * - INativeBridge: Native token-specific bridge operations
 * - BridgeStorage: Storage management and data persistence
 *
 * The type uses TypeScript's Omit utility to avoid property conflicts by giving
 * priority to INativeBridge over IBridge, and INativeBridge over BridgeStorage.
 */
export type NativeBridge = IBridge &
    Omit<INativeBridge, keyof IBridge> &
    Omit<BridgeStorage, keyof INativeBridge>

/**
 * Factory class for creating NativeBridge contract instances using proxy composition.
 *
 * This factory creates a complex composed object that merges multiple contract interfaces
 * into a single NativeBridge instance. Unlike simpler contracts (BridgeManagement, ExecutionManager),
 * NativeBridge requires proxy composition because it needs to combine functionality from
 * multiple separate contracts while maintaining a single interface.
 *
 * The NativeBridge contract is responsible for:
 * - Bridging native tokens (ETH, MATIC, etc.) between chains
 * - Managing native token deposits and withdrawals
 * - Handling native token balance tracking and validation
 * - Processing native token cross-chain transfers
 * - Integrating with bridge storage for persistent state management
 */
export class NativeBridgeFactory extends INativeBridge {
  /**
   * IBridge contract instance providing core bridge functionality.
   * Contains common bridge operations shared across all bridge types.
   */
  private readonly bridge: IBridge;

  /**
   * BridgeStorage contract instance providing data persistence functionality.
   * Handles storage operations for bridge state, transaction history, and configuration.
   */
  private readonly bridgeStorage: BridgeStorage;

  /**
   * Private constructor to enforce factory pattern usage.
   * Initializes the NativeBridge contract instance and creates composed contract instances.
   *
   * @param config - Contract wrapper configuration containing address, RPC endpoints, and wallet info
   */
  private constructor(config: ContractWrapperConfig) {
    const clientsConfig = BridgeContractBase.createViemContractClientsConfig(config);
    super(config.contractAddress as Address, clientsConfig);

    // Create IBridge contract instance for core bridge functionality
    this.bridge = BridgeContractBase.createContractInstance(
        IBridge,
        config
    );

    // Create BridgeStorage contract instance for data persistence
    this.bridgeStorage = BridgeContractBase.createContractInstance(
        BridgeStorage,
        config
    );
  }

  /**
   * Factory method that creates and returns a proxied NativeBridge contract instance.
   *
   * This method creates a composed proxy object that merges functionality from multiple
   * contract instances into a single interface. The proxy delegation follows priority order:
   * INativeBridge (primary) > IBridge > BridgeStorage. This ensures native-specific methods
   * take precedence over generic bridge methods.
   *
   * @param config - The contract wrapper configuration containing address and client settings
   * @returns A proxied instance of NativeBridge containing methods from IBridge, INativeBridge, and BridgeStorage
   */
  static create(config: ContractWrapperConfig): NativeBridge {
    const instance = new NativeBridgeFactory(config);

    // Create composed proxy that merges all contract interfaces into a single object
    // The proxy factory handles method binding and property delegation automatically
    return createComposedProxy(
        instance,
        [instance.bridge, instance.bridgeStorage] as const
    );
  }

  /**
   * Provides access to the underlying IBridge contract instance.
   * This method allows direct access to core bridge functionality when needed,
   * bypassing the proxy composition for specific use cases or debugging.
   *
   * @returns The IBridge contract instance containing core bridge operations
   */
  getBridgeContract(): IBridge {
    return this.bridge;
  }

  /**
   * Provides access to the underlying BridgeStorage contract instance.
   * This method allows direct access to storage functionality when needed,
   * bypassing the proxy composition for specific storage operations or debugging.
   *
   * @returns The BridgeStorage contract instance containing storage management operations
   */
  getBridgeStorageContract(): BridgeStorage {
    return this.bridgeStorage;
  }
}
