#!/usr/bin/env python3
"""Launcher for LedgerLens, Python edition. This file is readable on purpose.

    nkx-run python/run.py demo      protected checkout, after `nkx register` (see README)
    python3 python/run.py demo      development checkout with plaintext source

Exit codes: 0 ok, 1 selftest failure or runtime error, 2 bad input, 3 locked.
"""

import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

LOCKED = """\
LedgerLens is protected by NakodaX Source Protection.
The code in python/ledgerlens/ is encrypted: you can clone it, but not read it or run it.

Unlock it with the free trial key (takes about a minute):

  brew install nakodax/tap/nkx        (or download nkx from github.com/nakodax/nkx-cli/releases)
  pip install nkx-runtime
  nkx register --license-key-file trial/license.key --register-token-file trial/register.token
  NKX_REGISTER_TOKEN="$(cat trial/register.token)" nkx-run python/run.py demo

More in README.md, section "Try it in 60 seconds".
"""


def _under_nakodax():
    return "nkx_runtime" in sys.modules


def main():
    try:
        from ledgerlens.cli import main as app_main
    except (SyntaxError, ValueError, UnicodeDecodeError, ModuleNotFoundError) as exc:
        if isinstance(exc, ModuleNotFoundError) and (exc.name or "").split(".")[0] != "ledgerlens":
            raise
        if _under_nakodax():
            # The runtime is active but the import still failed: report it, don't pretend it's locked.
            print("NakodaX runtime is active but LedgerLens could not be loaded: %s" % exc, file=sys.stderr)
            return 1
        print(LOCKED)
        return 3
    return app_main(sys.argv[1:])


if __name__ == "__main__":
    sys.exit(main())
