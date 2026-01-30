import { describe, it } from 'node:test';
import assert from 'node:assert';
import { BridgeContractBase } from '../../src/evm/utils/bridge-base.js';
import { createComposedProxy } from '../../src/evm/utils/proxy-factory.js';

describe('EVM Utilities', () => {
  describe('BridgeContractBase', () => {
    it('should provide createContractConfig utility', () => {
      const mockConfig = {
        contractAddress: ('0x' + 'a'.repeat(40)) as `0x${string}`,
        publicClient: { test: 'public' } as any,
        walletClient: { test: 'wallet' } as any,
      };

      const result = BridgeContractBase.createContractConfig(mockConfig);

      assert.ok(result);
      assert.strictEqual(result.publicClient, mockConfig.publicClient);
      assert.strictEqual(result.walletClient, mockConfig.walletClient);
    });

    it('should provide createContractInstance utility', () => {
      class MockContract {
        constructor(public address: string, public config: any) {}
      }

      const mockConfig = {
        contractAddress: ('0x' + 'a'.repeat(40)) as `0x${string}`,
        publicClient: { test: 'public' } as any,
        walletClient: { test: 'wallet' } as any,
      };

      const instance = BridgeContractBase.createContractInstance(
        MockContract,
        mockConfig
      );

      assert.ok(instance instanceof MockContract);
      assert.strictEqual(instance.address, mockConfig.contractAddress);
      assert.strictEqual(instance.config.publicClient, mockConfig.publicClient);
      assert.strictEqual(instance.config.walletClient, mockConfig.walletClient);
    });
  });

  describe('createComposedProxy', () => {
    it('should create proxy that delegates to target first', () => {
      const target = {
        targetMethod: () => 'from-target',
        sharedProp: 'target-value',
      };

      const composed = {
        composedMethod: () => 'from-composed',
        sharedProp: 'composed-value',
      };

      const proxy = createComposedProxy(target, [composed]);

      // Should prefer target properties
      assert.strictEqual((proxy as any).targetMethod(), 'from-target');
      assert.strictEqual((proxy as any).sharedProp, 'target-value');

      // Should delegate to composed for missing properties
      assert.strictEqual((proxy as any).composedMethod(), 'from-composed');
    });

    it('should handle multiple composed instances in order', () => {
      const target = {
        targetMethod: () => 'target',
      };

      const composed1 = {
        method1: () => 'composed1',
        sharedMethod: () => 'from-composed1',
      };

      const composed2 = {
        method2: () => 'composed2',
        sharedMethod: () => 'from-composed2',
      };

      const proxy = createComposedProxy(target, [composed1, composed2]);

      assert.strictEqual((proxy as any).targetMethod(), 'target');
      assert.strictEqual((proxy as any).method1(), 'composed1');
      assert.strictEqual((proxy as any).method2(), 'composed2');

      // Should use first composed instance that has the property
      assert.strictEqual((proxy as any).sharedMethod(), 'from-composed1');
    });

    it('should handle non-function properties', () => {
      const target = {
        targetProp: 'target-value',
      };

      const composed = {
        composedProp: 'composed-value',
        composedNumber: 42,
      };

      const proxy = createComposedProxy(target, [composed]);

      assert.strictEqual((proxy as any).targetProp, 'target-value');
      assert.strictEqual((proxy as any).composedProp, 'composed-value');
      assert.strictEqual((proxy as any).composedNumber, 42);
    });

    it('should support "in" operator (has trap)', () => {
      const target = {
        targetProp: 'value',
      };

      const composed = {
        composedProp: 'value',
      };

      const proxy = createComposedProxy(target, [composed]);

      assert.ok('targetProp' in proxy);
      assert.ok('composedProp' in proxy);
      assert.ok(!('nonexistentProp' in proxy));
    });

    it('should return undefined for non-existent properties', () => {
      const target = {};
      const composed = {};

      const proxy = createComposedProxy(target, [composed]);

      assert.strictEqual((proxy as any).nonexistentProp, undefined);
    });
  });

  describe('Integration with real factory patterns', () => {
    it('should work with typical bridge factory pattern', () => {
      // Mock the main contract class
      class MainContract {
        constructor(public address: string, public config: any) {}
        mainMethod() { return 'main'; }
      }

      // Mock storage contract class
      class StorageContract {
        constructor(public address: string, public config: any) {}
        storageMethod() { return 'storage'; }
        get storageProperty() { return 'storage-prop'; }
      }

      const mockConfig = {
        contractAddress: ('0x' + 'a'.repeat(40)) as `0x${string}`,
        publicClient: { test: 'public' } as any,
        walletClient: { test: 'wallet' } as any,
      };

      // Create instances using the utility
      const mainInstance = BridgeContractBase.createContractInstance(
        MainContract,
        mockConfig
      );

      const storageInstance = BridgeContractBase.createContractInstance(
        StorageContract,
        mockConfig
      );

      // Create composed proxy
      const composedBridge = createComposedProxy(
        mainInstance,
        [storageInstance]
      );

      // Test that it works as expected
      assert.strictEqual((composedBridge as any).mainMethod(), 'main');
      assert.strictEqual((composedBridge as any).storageMethod(), 'storage');
      assert.strictEqual((composedBridge as any).storageProperty, 'storage-prop');
      assert.strictEqual((composedBridge as any).address, mockConfig.contractAddress);
    });
  });
});
