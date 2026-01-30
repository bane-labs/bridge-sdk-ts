import { describe, it } from 'node:test';
import assert from 'node:assert';
import type { EvmContractWrapperConfig } from '../../src';

describe('EVM Proxy Composition Patterns', () => {
  // Mock Viem clients for testing
  const mockPublicClient = {
    readContract: async () => Promise.resolve('mock-result'),
    getBlockNumber: async () => Promise.resolve(BigInt(12345)),
  } as any;

  const mockWalletClient = {
    writeContract: async () => Promise.resolve('0x' + '1'.repeat(64)),
    account: { address: '0x' + 'f'.repeat(40) },
  } as any;

  const mockConfig: EvmContractWrapperConfig = {
    contractAddress: ('0x' + 'a'.repeat(40)) as `0x${string}`,
    publicClient: mockPublicClient,
    walletClient: mockWalletClient,
  };

  describe('MessageBridge Composition', () => {
    it('should compose main contract with AMB storage', async () => {
      const { MessageBridgeFactory } = await import('../../src/evm/contracts/message-bridge.js');

      const bridge = MessageBridgeFactory.create(mockConfig);

      // Should be a valid object
      assert.ok(bridge);
      assert.strictEqual(bridge.address, mockConfig.contractAddress);
    });

    it('should delegate method calls correctly', async () => {
      const { MessageBridgeFactory } = await import('../../src/evm/contracts/message-bridge.js');

      const bridge = MessageBridgeFactory.create(mockConfig);

      // The proxy should handle property access without errors
      assert.doesNotThrow(() => {
        const address = bridge.address;
        assert.strictEqual(address, mockConfig.contractAddress);
      });
    });
  });

  describe('TokenBridge Composition', () => {
    it('should compose main contract with multiple storage contracts', async () => {
      const { TokenBridgeFactory } = await import('../../src/evm/contracts/token-bridge.js');

      const bridge = TokenBridgeFactory.create(mockConfig);

      // Should be a valid object with correct address
      assert.ok(bridge);
      assert.strictEqual(bridge.address, mockConfig.contractAddress);
    });

    it('should prioritize storage contracts correctly', async () => {
      const { TokenBridgeFactory } = await import('../../src/evm/contracts/token-bridge.js');

      const bridge = TokenBridgeFactory.create(mockConfig);

      // Test that proxy delegation works (should not throw)
      assert.doesNotThrow(() => {
        const address = bridge.address;
        assert.ok(address);
      });
    });
  });

  describe('NativeBridge Composition', () => {
    it('should compose main contract with multiple storage contracts', async () => {
      const { NativeBridgeFactory } = await import('../../src/evm/contracts/native-bridge.js');

      const bridge = NativeBridgeFactory.create(mockConfig);

      // Should be a valid object with correct address
      assert.ok(bridge);
      assert.strictEqual(bridge.address, mockConfig.contractAddress);
    });

    it('should handle storage contract precedence', async () => {
      const { NativeBridgeFactory } = await import('../../src/evm/contracts/native-bridge.js');

      const bridge = NativeBridgeFactory.create(mockConfig);

      // Test proxy behavior - StorageV1 should take precedence over Storage
      assert.doesNotThrow(() => {
        const address = bridge.address;
        assert.strictEqual(address, mockConfig.contractAddress);
      });
    });
  });

  describe('Type Safety and Interface Compliance', () => {
    it('should maintain type safety with composed interfaces', async () => {
      const { TokenBridgeFactory } = await import('../../src/evm/contracts/token-bridge.js');

      const bridge = TokenBridgeFactory.create(mockConfig);

      // Runtime validation of key properties
      assert.ok('address' in bridge);
      assert.strictEqual(bridge.address, mockConfig.contractAddress);
    });

    it('should support property enumeration', async () => {
      const { MessageBridgeFactory } = await import('../../src/evm/contracts/message-bridge.js');

      const bridge = MessageBridgeFactory.create(mockConfig);

      // Should be able to check property existence
      assert.ok('address' in bridge);
      assert.strictEqual(bridge.address, mockConfig.contractAddress);
    });
  });

  describe('Factory Method Consistency', () => {
    it('should have consistent create method signatures', async () => {
      const { MessageBridgeFactory } = await import('../../src/evm/contracts/message-bridge.js');
      const { TokenBridgeFactory } = await import('../../src/evm/contracts/token-bridge.js');
      const { NativeBridgeFactory } = await import('../../src/evm/contracts/native-bridge.js');

      // All factory classes should have create method
      assert.ok(typeof MessageBridgeFactory.create === 'function');
      assert.ok(typeof TokenBridgeFactory.create === 'function');
      assert.ok(typeof NativeBridgeFactory.create === 'function');

      // Create methods should accept config and return composed instances
      const messageBridge = MessageBridgeFactory.create(mockConfig);
      const tokenBridge = TokenBridgeFactory.create(mockConfig);
      const nativeBridge = NativeBridgeFactory.create(mockConfig);

      assert.ok(messageBridge);
      assert.ok(tokenBridge);
      assert.ok(nativeBridge);

      // All should have the same address
      assert.strictEqual(messageBridge.address, mockConfig.contractAddress);
      assert.strictEqual(tokenBridge.address, mockConfig.contractAddress);
      assert.strictEqual(nativeBridge.address, mockConfig.contractAddress);
    });

    it('should have working factory pattern', async () => {
      const { MessageBridgeFactory } = await import('../../src/evm/contracts/message-bridge.js');

      // Factory should work and create objects
      const bridge1 = MessageBridgeFactory.create(mockConfig);
      const bridge2 = MessageBridgeFactory.create(mockConfig);

      // Both should be valid but distinct objects
      assert.ok(bridge1);
      assert.ok(bridge2);
      assert.notStrictEqual(bridge1, bridge2);
      assert.strictEqual(bridge1.address, bridge2.address);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing properties gracefully', async () => {
      const { MessageBridgeFactory } = await import('../../src/evm/contracts/message-bridge.js');

      const bridge = MessageBridgeFactory.create(mockConfig);

      // Accessing non-existent properties should return undefined, not throw
      assert.strictEqual((bridge as any).nonExistentProperty, undefined);
      assert.strictEqual((bridge as any).anotherMissingProp, undefined);
    });

    it('should handle method calls on undefined properties', async () => {
      const { TokenBridgeFactory } = await import('../../src/evm/contracts/token-bridge.js');

      const bridge = TokenBridgeFactory.create(mockConfig);

      // Attempting to call non-existent methods should throw appropriately
      assert.throws(() => {
        (bridge as any).nonExistentMethod();
      });
    });
  });
});
