import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Library imports', () => {
  it('should import all main exports', async () => {
    const {
      NeoMessageBridge,
      NeoNativeBridge,
      NeoTokenBridge,
      getAllBalances,
      getGasBalance,
      neonAdapter,
      NeoInvalidParameterError,
      NeoContractInvocationError,
      NeoInsufficientFundsError,
      NeoGenericError,
    } = await import('../../src');

    assert.ok(NeoMessageBridge);
    assert.ok(NeoNativeBridge);
    assert.ok(NeoTokenBridge);
    assert.ok(getAllBalances);
    assert.ok(getGasBalance);
    assert.ok(neonAdapter);
    assert.ok(NeoInvalidParameterError);
    assert.ok(NeoContractInvocationError);
    assert.ok(NeoInsufficientFundsError);
    assert.ok(NeoGenericError);
  });

  it('should import from built distribution', async () => {
    const {NeoMessageBridge, NeoNativeBridge, NeoTokenBridge, neonAdapter} = await import('../../dist');

    assert.ok(NeoMessageBridge);
    assert.ok(NeoNativeBridge);
    assert.ok(NeoTokenBridge);
    assert.ok(neonAdapter);
  });
});
