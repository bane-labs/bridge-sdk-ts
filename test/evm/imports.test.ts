import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('EVM Library imports', () => {
  it('should import all EVM main exports', async () => {
    const {
      EvmMessageBridgeFactory,
      EvmNativeBridgeFactory,
      EvmTokenBridgeFactory,
      EvmBridgeManagementFactory,
      EvmExecutionManagerFactory,
    } = await import('../../src');

    // Factory exports (explicit factory names)
    assert.ok(EvmMessageBridgeFactory);
    assert.ok(EvmNativeBridgeFactory);
    assert.ok(EvmTokenBridgeFactory);
    assert.ok(EvmBridgeManagementFactory);
    assert.ok(EvmExecutionManagerFactory);
  });

  it('should import EVM factory classes with create methods', async () => {
    const {
      EvmMessageBridgeFactory,
      EvmNativeBridgeFactory,
      EvmTokenBridgeFactory,
      EvmBridgeManagementFactory,
      EvmExecutionManagerFactory,
    } = await import('../../src');

    assert.ok(typeof EvmMessageBridgeFactory.create === 'function');
    assert.ok(typeof EvmNativeBridgeFactory.create === 'function');
    assert.ok(typeof EvmTokenBridgeFactory.create === 'function');
    assert.ok(typeof EvmBridgeManagementFactory.create === 'function');
    assert.ok(typeof EvmExecutionManagerFactory.create === 'function');
  });

  it('should import EVM factory classes as constructors', async () => {
    const {
      EvmBridgeManagementFactory,
      EvmExecutionManagerFactory,
    } = await import('../../src');

    assert.ok(typeof EvmBridgeManagementFactory === 'function');
    assert.ok(typeof EvmExecutionManagerFactory === 'function');
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
      EvmBridgeManagementFactory,
    } = await import('../../src');

    // Mock config for testing
    const mockConfig = {
      contractAddress: ('0x' + 'a'.repeat(40)) as `0x${string}`,
      publicClient: { test: 'public' } as any,
      walletClient: { test: 'wallet' } as any,
    };

    // Factory classes should have static create method
    assert.ok(typeof EvmMessageBridgeFactory.create === 'function');
    assert.ok(typeof EvmBridgeManagementFactory.create === 'function');

    // Test that factory creates valid objects
    const bridge = EvmMessageBridgeFactory.create(mockConfig);
    assert.ok(bridge);
    assert.strictEqual(bridge.address, mockConfig.contractAddress);

    // Test that factory creates valid objects
    const management = EvmBridgeManagementFactory.create(mockConfig);
    assert.ok(management);
    assert.strictEqual(management.address, mockConfig.contractAddress);
  });
});
