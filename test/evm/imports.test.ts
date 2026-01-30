import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('EVM Library imports', () => {
  it('should import all EVM main exports', async () => {
    const {
      EvmMessageBridgeFactory,
      EvmNativeBridgeFactory,
      EvmTokenBridgeFactory,
      EvmBridgeManagement,
      EvmExecutionManager,
    } = await import('../../src');

    // Factory exports (explicit factory names)
    assert.ok(EvmMessageBridgeFactory);
    assert.ok(EvmNativeBridgeFactory);
    assert.ok(EvmTokenBridgeFactory);

    // Simple contract exports
    assert.ok(EvmBridgeManagement);
    assert.ok(EvmExecutionManager);
  });

  it('should import EVM factory classes with create methods', async () => {
    const {
      EvmMessageBridgeFactory,
      EvmNativeBridgeFactory,
      EvmTokenBridgeFactory,
    } = await import('../../src');

    assert.ok(typeof EvmMessageBridgeFactory.create === 'function');
    assert.ok(typeof EvmNativeBridgeFactory.create === 'function');
    assert.ok(typeof EvmTokenBridgeFactory.create === 'function');
  });

  it('should import EVM simple contract classes as constructors', async () => {
    const {
      EvmBridgeManagement,
      EvmExecutionManager,
    } = await import('../../src');

    assert.ok(typeof EvmBridgeManagement === 'function');
    assert.ok(typeof EvmExecutionManager === 'function');
  });

  it('should import EVM types', async () => {
    const module = await import('../../src');

    // Check that the module contains type exports (they won't have runtime values)
    // but the module should have imported successfully
    assert.ok(module);
  });

  it('should verify factory classes are callable', async () => {
    const {
      EvmMessageBridgeFactory,
      EvmBridgeManagement,
    } = await import('../../src');

    // Mock config for testing
    const mockConfig = {
      contractAddress: ('0x' + 'a'.repeat(40)) as `0x${string}`,
      publicClient: { test: 'public' } as any,
      walletClient: { test: 'wallet' } as any,
    };

    // Factory classes should have static create method
    assert.ok(typeof EvmMessageBridgeFactory.create === 'function');

    // Simple contract classes should be constructable
    assert.ok(typeof EvmBridgeManagement === 'function');

    // Test that factory creates valid objects
    const bridge = EvmMessageBridgeFactory.create(mockConfig);
    assert.ok(bridge);
    assert.strictEqual(bridge.address, mockConfig.contractAddress);

    // Test that constructor creates valid objects
    const management = new EvmBridgeManagement(mockConfig);
    assert.ok(management);
    assert.strictEqual(management.address, mockConfig.contractAddress);
  });
});
