import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Library imports', () => {
  it('should import all main exports', async () => {
    const {
      MessageBridge,
      neonAdapter,
      InvalidParameterError,
      ContractInvocationError,
      InsufficientFundsError,
      GenericError,
    } = await import('../src/index.js');

    assert.ok(MessageBridge);
    assert.ok(neonAdapter);
    assert.ok(InvalidParameterError);
    assert.ok(ContractInvocationError);
    assert.ok(InsufficientFundsError);
    assert.ok(GenericError);
  });

  it('should import from built distribution', async () => {
    const {MessageBridge, neonAdapter} = await import('../dist/index.js');

    assert.ok(MessageBridge);
    assert.ok(neonAdapter);
  });
});
