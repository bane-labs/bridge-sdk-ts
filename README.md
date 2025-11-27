# bridge-sdk-ts

A TypeScript ESM library for interacting with the Neo Bridge and related smart contracts. Designed for use in both front-end and back-end TypeScript projects.

## Features
- ESM-compatible TypeScript library
- Works in Node.js and modern browsers
- Adapter for using neon-js (CJS) in ESM environments
- Type-safe contract interaction utilities

## Installation

Because this is still a beta version, to install from npm, run:

```
npm install @bane-labs/bridge-sdk-ts@beta
```

## Usage

Import the main classes and utilities:

```typescript
import { MessageBridge, neonAdapter, InvalidParameterError } from '@bane-labs/bridge-sdk-ts';
```

### Example: Creating a MessageBridge

```typescript
import { MessageBridge } from '@bane-labs/bridge-sdk-ts';

const config = {
  rpcUrl: 'https://mainnet1.neo.coz.io:443',
  contractHash: '0x...your_contract_hash...',
  account: { /* your account object */ }
};

const bridge = new MessageBridge(config);
```

### Example: Using neonAdapter

`neonAdapter` is a utility object that provides a clean, ESM-compatible interface to the core features of the [neon-js](https://github.com/CityOfZion/neon-js) library. It normalizes exports and provides type-safe helpers for working with Neo accounts, contract parameters, transactions, and more. Use it to create and validate Neo blockchain objects in both browser and Node.js environments.

```typescript
import { neonAdapter } from '@bane-labs/bridge-sdk-ts';

const account = neonAdapter.create.account('your-private-key');
const param = neonAdapter.create.contractParam('String', 'hello');
```

## Publishing & Versioning

- Pre-release versions are published with the `beta` tag.
- For production, use the latest stable version.
