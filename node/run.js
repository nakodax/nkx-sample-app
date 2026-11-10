#!/usr/bin/env node
'use strict';
// Launcher for LedgerLens, Node edition. This file is readable on purpose.
//
//   npx -p @nakodax/runtime nkx-run node/run.js demo   protected checkout, after `nkx register` (see README)
//   node node/run.js demo                              development checkout with plaintext source
//
// Exit codes: 0 ok, 1 selftest failure or runtime error, 2 bad input, 3 locked.

const LOCKED = `LedgerLens is protected by NakodaX Source Protection.
The code in node/ledgerlens/ is encrypted: you can clone it, but not read it or run it.

Unlock it with the free trial key (takes about a minute):

  brew install nakodax/tap/nkx        (or download nkx from github.com/nakodax/nkx-cli/releases)
  nkx register --license-key-file trial/license.key --register-token-file trial/register.token
  NKX_REGISTER_TOKEN="$(cat trial/register.token)" npx -p @nakodax/runtime nkx-run node/run.js demo

More in README.md, section "Try it in 60 seconds".
`;

function underNakodax() {
  return Object.keys(require.cache).some((p) => /[\\/]@nakodax[\\/]runtime[\\/]/.test(p));
}

function load() {
  try {
    return require('./ledgerlens/cli');
  } catch (err) {
    const missing = err && err.code === 'MODULE_NOT_FOUND' && /ledgerlens/.test(err.message);
    if (!(err instanceof SyntaxError) && !missing) throw err;
    if (underNakodax()) {
      // The runtime is active but loading still failed: report it, don't pretend it's locked.
      console.error(`NakodaX runtime is active but LedgerLens could not be loaded: ${err.message}`);
      process.exitCode = 1;
      return null;
    }
    console.log(LOCKED);
    process.exitCode = 3;
    return null;
  }
}

const app = load();
if (app) process.exitCode = app.main(process.argv.slice(2));
