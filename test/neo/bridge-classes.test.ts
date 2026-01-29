import { before, describe, it } from 'node:test';
import assert from 'node:assert';
import type { NeoContractWrapperConfig } from '../../src';
import { NeoNativeBridge, NeoTokenBridge } from '../../src';

describe('Bridge Classes', () => {
  let mockConfig: NeoContractWrapperConfig;

  before(() => {
    mockConfig = {
      rpcUrl: 'https://mainnet1.neo.coz.io:443',
      contractHash: '0x' + 'a'.repeat(40),
      // @ts-ignore because we are mocking the account
      account: {
        address: 'NMBfzaEq2c5zodiNbLPoohVENARMbJim1r',
        scriptHash: '0x' + 'b'.repeat(40),
        publicKey: '0x' + 'c'.repeat(66)
      }
    };
  });

  describe('NeoNativeBridge', () => {
    let bridge: NeoNativeBridge;

    before(() => {
      bridge = new NeoNativeBridge(mockConfig);
    });

    it('should create NativeBridge instance', () => {
      assert.ok(bridge instanceof NeoNativeBridge);
    });

    it('should store config correctly', () => {
      assert.strictEqual(bridge.getConfig().contractHash, mockConfig.contractHash);
      assert.strictEqual(bridge.getConfig().rpcUrl, mockConfig.rpcUrl);
    });

    it('should have native bridge methods', () => {
      assert.ok(typeof bridge.depositNative === 'function');
      assert.ok(typeof bridge.withdrawNative === 'function');
      assert.ok(typeof bridge.nativeToken === 'function');
      assert.ok(typeof bridge.nativeDepositFee === 'function');
    });
  });

  describe('NeoTokenBridge', () => {
    let bridge: NeoTokenBridge;

    before(() => {
      bridge = new NeoTokenBridge(mockConfig);
    });

    it('should create TokenBridge instance', () => {
      assert.ok(bridge instanceof NeoTokenBridge);
    });

    it('should store config correctly', () => {
      assert.strictEqual(bridge.getConfig().contractHash, mockConfig.contractHash);
      assert.strictEqual(bridge.getConfig().rpcUrl, mockConfig.rpcUrl);
    });

    it('should have token bridge methods', () => {
      assert.ok(typeof bridge.depositToken === 'function');
      assert.ok(typeof bridge.withdrawToken === 'function');
      assert.ok(typeof bridge.isRegisteredToken === 'function');
      assert.ok(typeof bridge.registerToken === 'function');
      assert.ok(typeof bridge.tokenDepositFee === 'function');
    });
  });
});
