import { before, describe, it } from 'node:test';
import assert from 'node:assert';
import type { EvmContractWrapperConfig } from '../../src';
import {
  EvmMessageBridgeFactory,
  EvmNativeBridgeFactory,
  EvmTokenBridgeFactory,
  EvmBridgeManagementFactory,
  EvmExecutionManagerFactory
} from '../../src';

// Mock Viem clients for testing
const mockPublicClient = {
  readContract: async () => Promise.resolve('mock-result'),
  getBlockNumber: async () => Promise.resolve(BigInt(12345)),
} as any;

const mockWalletClient = {
  writeContract: async () => Promise.resolve('0x' + '1'.repeat(64)),
  account: { address: '0x' + 'f'.repeat(40) },
} as any;

describe('EVM Bridge Classes', () => {
  let mockConfig: EvmContractWrapperConfig;

  before(() => {
    mockConfig = {
      contractAddress: ('0x' + 'a'.repeat(40)) as `0x${string}`,
      publicClient: mockPublicClient,
      walletClient: mockWalletClient,
    };
  });

  describe('EvmMessageBridge', () => {
    let bridge: any;

    before(() => {
      bridge = EvmMessageBridgeFactory.create(mockConfig);
    });

    it('should create MessageBridge instance via factory', () => {
      assert.ok(bridge);
      assert.ok(typeof bridge === 'object');
    });

    it('should have correct contract address', () => {
      assert.strictEqual(bridge.address, mockConfig.contractAddress);
    });

    it('should be accessible as a composed object', () => {
      // Test that the proxy composition works by checking basic properties
      assert.ok('address' in bridge);
      assert.ok(bridge.address === mockConfig.contractAddress);
    });
  });

  describe('EvmNativeBridge', () => {
    let bridge: any;

    before(() => {
      bridge = EvmNativeBridgeFactory.create(mockConfig);
    });

    it('should create NativeBridge instance via factory', () => {
      assert.ok(bridge);
      assert.ok(typeof bridge === 'object');
    });

    it('should have correct contract address', () => {
      assert.strictEqual(bridge.address, mockConfig.contractAddress);
    });

    it('should be accessible as a composed object', () => {
      // Test that the proxy composition works
      assert.ok('address' in bridge);
      assert.ok(bridge.address === mockConfig.contractAddress);
    });

    it('should allow access to factory methods for storage contracts', () => {
      // Test that we can access the factory instance methods if needed
      assert.ok(typeof EvmNativeBridgeFactory.create === 'function');
    });
  });

  describe('EvmTokenBridge', () => {
    let bridge: any;

    before(() => {
      bridge = EvmTokenBridgeFactory.create(mockConfig);
    });

    it('should create TokenBridge instance via factory', () => {
      assert.ok(bridge);
      assert.ok(typeof bridge === 'object');
    });

    it('should have correct contract address', () => {
      assert.strictEqual(bridge.address, mockConfig.contractAddress);
    });

    it('should be accessible as a composed object', () => {
      // Test that the proxy composition works
      assert.ok('address' in bridge);
      assert.ok(bridge.address === mockConfig.contractAddress);
    });

    it('should allow access to factory methods for storage contracts', () => {
      // Test that we can access the factory instance methods if needed
      assert.ok(typeof EvmTokenBridgeFactory.create === 'function');
    });
  });

  describe('EvmBridgeManagement', () => {
    let bridge: any;

    before(() => {
      bridge = EvmBridgeManagementFactory.create(mockConfig);
    });

    it('should create BridgeManagement instance', () => {
      assert.ok(bridge);
      assert.ok(typeof bridge === 'object');
    });

    it('should store contract address correctly', () => {
      assert.strictEqual(bridge.address, mockConfig.contractAddress);
    });

    it('should be a direct contract instance', () => {
      // This is a simple contract, not a composed one
      assert.ok(bridge.address);
    });
  });

  describe('EvmExecutionManager', () => {
    let bridge: any;

    before(() => {
      bridge = EvmExecutionManagerFactory.create(mockConfig);
    });

    it('should create ExecutionManager instance', () => {
      assert.ok(bridge);
      assert.ok(typeof bridge === 'object');
    });

    it('should store contract address correctly', () => {
      assert.strictEqual(bridge.address, mockConfig.contractAddress);
    });

    it('should be a direct contract instance', () => {
      // This is a simple contract, not a composed one
      assert.ok(bridge.address);
    });
  });

  describe('Shared Configuration Handling', () => {
    it('should handle configuration with wallet client', () => {
      const configWithWallet = {
        ...mockConfig,
        walletClient: mockWalletClient,
      };

      const bridge = EvmBridgeManagementFactory.create(configWithWallet);
      assert.ok(bridge);
      assert.strictEqual(bridge.address, configWithWallet.contractAddress);
    });

    it('should handle configuration without wallet client', () => {
      const configWithoutWallet = {
        contractAddress: mockConfig.contractAddress,
        publicClient: mockConfig.publicClient,
        // walletClient is optional
      };

      const bridge = EvmExecutionManagerFactory.create(configWithoutWallet);
      assert.ok(bridge);
      assert.strictEqual(bridge.address, configWithoutWallet.contractAddress);
    });
  });
});
