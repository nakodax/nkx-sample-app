<p align="center">
  <a href="https://nakodax.com/source">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://nakodax.com/branding/nakodax-lockup.svg">
      <img alt="NakodaX" src="https://nakodax.com/branding/nakodax-lockup-on-light.svg" width="260">
    </picture>
  </a>
</p>

# nkx-sample-app: run an encrypted app with NakodaX Source Protection

**Our code is public. Our source isn't.**

[![try-it](https://github.com/nakodax/nkx-sample-app/actions/workflows/try-it.yml/badge.svg)](https://github.com/nakodax/nkx-sample-app/actions/workflows/try-it.yml) ![Encryption: AES-256-GCM](https://img.shields.io/badge/encryption-AES--256--GCM-00B26D) ![Runtimes: Python and Node.js](https://img.shields.io/badge/runtimes-Python%20%7C%20Node.js-555) ![Trial key: included](https://img.shields.io/badge/trial%20key-included-00B26D) ![Licence: evaluation](https://img.shields.io/badge/licence-evaluation-555)

**nkx-sample-app is a small application whose source code is encrypted with NakodaX Source Protection. A free trial key ships with this repository, so you can unlock it and run it on your own machine in about a minute.**

You can clone the code, but you can't read it. Run it without a key and you get a locked screen. Run it with the trial key and the NakodaX runtime decrypts it in memory and runs it. Nothing decrypted is ever written to disk.

[Try it](#try-it-in-60-seconds) · [What happens when you run it](#what-happens-when-you-run-it) · [The original app](#the-original-app-ledgerlens) · [Original vs protected](#original-vs-protected) · [Protect your own repository](#protect-your-own-repository) · [FAQ](#frequently-asked-questions)

## Try it in 60 seconds

You need Python 3.10 or newer, and the [`nkx` CLI](https://github.com/nakodax/nkx-cli): run `brew install nakodax/tap/nkx`, or download it for macOS, Linux or Windows from its [releases page](https://github.com/nakodax/nkx-cli/releases).

```bash
git clone https://github.com/nakodax/nkx-sample-app && cd nkx-sample-app

# 1. Without a key: the app is locked
python3 python/run.py

# 2. Install the runtime and register the trial key in this folder
pip install nkx-runtime
nkx register --license-key-file trial/license.key --register-token-file trial/register.token

# 3. First run: registers this machine, then runs the app
NKX_REGISTER_TOKEN="$(cat trial/register.token)" nkx-run python/run.py demo

# 4. Every run after that: no environment variables needed
nkx-run python/run.py demo
```

Then run the same app in Node.js 20 or newer:

```bash
npx -p @nakodax/runtime nkx-run node/run.js demo
```

On Windows, run these in Git Bash, or in PowerShell set the token with `$env:NKX_REGISTER_TOKEN = Get-Content trial/register.token` before step 3.

**What you should see.** Step 1 stops with a locked screen and exit code 3:

```text
LedgerLens is protected by NakodaX Source Protection.
The code in python/ledgerlens/ is encrypted: you can clone it, but not read it or run it.
```

Steps 3 and 4 run the app. The second line of the output tells you it is running from encrypted code:

```text
LedgerLens 1.4.0  revenue intelligence   Python 3.12
protected  source is encrypted on disk, decrypted in memory by NakodaX (nkx-runtime 2.2.2)
...
Result fingerprint  65DE-0326-A82D-36CD
```

Python and Node.js print **the same fingerprint**. Each runtime decrypted its own copy of the app and ran real code. Run `make parity` to compare every stage.

## What happens when you run it

```
 your machine                                         app.nakodax.com
 ────────────                                         ───────────────
 python3 python/run.py
   └ no NakodaX runtime: locked screen, exit 3

 nkx register ...
   └ saves the trial licence and settings in .nkx/ (this folder only, git-ignored)

 nkx-run python/run.py demo
   │ first run only: registers this machine  ──────►  is the licence valid, active, not expired?
   │                                         ◄──────  a key for this release only
   │ decrypts each module in memory as it loads
   └ runs LedgerLens     (ciphertext stays on disk unchanged; no plaintext is written)
```

1. **Locked.** `python/run.py` and `node/run.js` are small readable launchers. Started without the NakodaX runtime, they find only ciphertext and show the locked screen.
2. **Register.** `nkx register` saves the trial licence and this project's settings in `.nkx/` inside your clone. Nothing outside the folder changes.
3. **First run.** `nkx-run` registers this machine against the trial licence. The register token is used once, then cleared from memory.
4. **Every run.** The runtime checks the licence online, gets the key for this release, and decrypts each module in memory as Python imports it or Node.js loads it.
5. **Switched off.** If NakodaX disables the trial key, or it expires, the next run is locked again. No new release is needed.

To start again from scratch, delete the `.nkx/license.key`, `.nkx/config.json` and `.nkx/instance_nonce` files in your clone.

## The original app: LedgerLens

LedgerLens is a small revenue-intelligence engine, written twice: once in Python and once in Node.js, with integer maths only so both give identical results. It builds a synthetic year of orders (5,436 orders from 96 customers) and runs seven stages: order book, pricing engine, revenue breakdown, customer segments, forecast, anomaly detection and price optimiser.

```text
02  Pricing engine: sample quotes
  LL-120 Business Seat x 12  Enterprise  2025-12-25 (Thu)
    list $199.00 -> volume -5.00%, segment:Enterprise -7.00%, thursday-flash -1.50%, quarter-end-push -4.00%
    unit $166.25   total $1,995.00   margin 59.09%

06  Anomaly detection
  2026-02-11  Wed  spike  48 (expected ~16)  $74,461  +10.7σ  critical
```

| Command | What it does |
|---|---|
| `demo` | all seven stages (default) |
| `quote --sku LL-120 --qty 12 --segment Enterprise --day 52` | price one basket |
| `segments` · `forecast` · `anomalies` · `optimize` | one stage on its own |
| `export` | a digest per stage, for comparing runtimes |
| `selftest` | known-answer tests inside the encrypted code |

Run any of them with `nkx-run python/run.py <command>` or `npx -p @nakodax/runtime nkx-run node/run.js <command>`.

The original source has 14 modules in each language, about 65 KB of code in all:

```
python/ledgerlens/   __init__  anomaly  canon  catalog  cli  dataset  dates  fmt
                     forecast  optimizer  pipeline  pricing  rng  segments
node/ledgerlens/     anomaly  canon  catalog  cli  dataset  dates  fmt  forecast
                     index  optimizer  pipeline  pricing  rng  segments
```

## Original vs protected

The same file, `python/ledgerlens/pricing.py`, before and after NakodaX Source Protection:

<table>
<tr><th>Original (2,062 bytes)</th><th>Protected: <code>pricing.py.nkxc</code> (2,090 bytes)</th></tr>
<tr><td>

```python
def volume_bps(qty):
    for min_qty, bps in VOLUME_TIERS:
        if qty >= min_qty:
            return bps
    return 0
```

</td><td>

```text
00000000: baf8 993e d4b6 9d13 bf00 7fd0 d59f 6bc7
00000010: 1be0 de4f 97bf b083 63b2 44c6 ff3b 9780
00000020: 2c4a 6a86 a521 c70f d10e ed4e f852 a3b0
00000030: 709b e039 3291 18bc 1ba3 c386 839a aec4
```

</td></tr>
</table>

The protected side shows the first 64 bytes. The exact bytes change with every protected release, because each release is encrypted afresh.

| | Original app | Protected app (this repository) |
|---|---|---|
| **Source files** | Readable `.py` and `.js` | `.nkxc` ciphertext, one per file, 28 bytes bigger than the original |
| **Folder and file names** | As written | Unchanged |
| **Run with** | `python3 python/run.py` · `node node/run.js` | `nkx-run python/run.py` · `npx -p @nakodax/runtime nkx-run node/run.js` |
| **Without a key** | Runs | Locked screen, exit code 3 |
| **Application code changes** | None | None |
| **Output** | Fingerprint `65DE-0326-A82D-36CD` | Fingerprint `65DE-0326-A82D-36CD` |
| **Access** | Anyone with a copy | Only machines with a valid licence, checked online |

**What stays readable in this repository:** this README, `LICENSE`, `SECURITY.md`, `Makefile`, `.gitignore`, the two launchers (`python/run.py`, `node/run.js`), `python/pyproject.toml`, `python/requirements.txt`, `node/package.json`, the trial key in `trial/`, the workflow in `.github/`, and the encryption manifests in `.nkx/`. Python needs its package marker on disk, so `python/ledgerlens/__init__.py` (a docstring and the version number) is readable too. Every other file in `python/ledgerlens/` and `node/ledgerlens/` is encrypted, including the `*.mock.*.nkxc` companion stubs used by NakodaX tooling.

Check it yourself:

```bash
git ls-files '*.nkxc' | wc -l                       # encrypted files
head -c 64 python/ledgerlens/pricing.py.nkxc | xxd  # random bytes, no code
grep -l -a -E '^(import|def|class|function|const) ' -r --include='*.nkxc' . | wc -l   # 0
```

## Protect your own repository

This repository was protected the same way you would protect yours, in the NakodaX console at [app.nakodax.com](https://app.nakodax.com):

1. **Connect** your GitHub repository.
2. **Choose** which files to protect. Everything else, such as your README, launchers and config, stays readable.
3. **Protect.** NakodaX writes an encrypted copy to a repository you choose. Your source repository is not changed. Protection runs in an isolated, single-use container that no one at NakodaX can access, and it is destroyed when protection finishes.
4. **Issue keys** for each customer, team or machine: a licence, plus a register token for each deployment. End or rotate access at any time.
5. **Run.** Your users install [`nkx-runtime`](https://pypi.org/project/nkx-runtime/) (Python) or [`@nakodax/runtime`](https://www.npmjs.com/package/@nakodax/runtime) (Node.js) and start your app with `nkx-run`. Your application code does not change.

Read more at [nakodax.com/source](https://nakodax.com/source), or email **support@nakodax.com**.

## The trial key

The two files in [`trial/`](trial/) are committed on purpose:

| File | What it is | What it can do |
|---|---|---|
| `trial/license.key` | the trial licence, signed by NakodaX | unlock this sample app only |
| `trial/register.token` | a registration token for this repository | register a machine for this sample app, and nothing else |

The trial key is not a secret. It cannot unlock any other NakodaX protected repository, and it cannot read or change anything else in NakodaX. It expires on 9 March 2027, and NakodaX can switch it off at any time.

**What NakodaX records.** Each machine that registers with the trial key is recorded in NakodaX Core with a machine ID, the IP address it connected from, and the time of its last check-in. Do not use the trial key from a machine you do not want recorded.

## Frequently asked questions

### What is nkx-sample-app?

nkx-sample-app is a public demo of NakodaX Source Protection. It holds LedgerLens, a small app in Python and Node.js, with its source encrypted, plus a free trial key so anyone can unlock it and run it.

### Is the source code really encrypted?

Yes. Each protected file is encrypted with AES-256-GCM using its own random key, and each ciphertext is bound to its file path, so renaming or swapping files makes decryption fail. File keys are wrapped and are useless without a valid NakodaX licence.

### Is decrypted code written to disk?

No. The NakodaX runtime decrypts each module in memory as it loads. The files on disk stay encrypted while the app runs.

### Does it need an internet connection?

Yes. The trial licence is checked online on every run, which is how NakodaX can switch it off at once.

### Why is the app written in both Python and Node.js?

To prove the decryption is real and exact. Two runtimes, each decrypting its own copy, print the same fingerprint: `65DE-0326-A82D-36CD`.

### How is encryption different from obfuscation?

Obfuscated code is still code: anyone can run it, and with enough effort read it. An encrypted file cannot be read or run until a licensed NakodaX runtime decrypts it.

### Do I need to change my code to protect it?

No. You choose the files to protect, NakodaX encrypts them, and your users start the app with `nkx-run` instead of `python` or `node`.

### Which languages does NakodaX Source Protection support?

This repository shows Python and JavaScript. NakodaX Source Protection also protects TypeScript and SQL, with docs, scripts and config sealed as text. See [nakodax.com/source](https://nakodax.com/source) for the full list.

### Can an AI model or LLM read this repository?

No. Without a licence, the protected files are ciphertext. An AI model, a code search index or a scraper learns nothing from them beyond file names.

### Is this repository open source?

No. It is public, under an evaluation licence. You may run and evaluate the app. You may not copy, modify or redistribute the decrypted code, or use it to train machine-learning systems. See [`LICENSE`](LICENSE).

## Key terms

- **Source code protection:** keeping source code encrypted so people and tools that hold a copy cannot read it.
- **NakodaX runtime:** `nkx-runtime` for Python or `@nakodax/runtime` for Node.js. It checks the licence and decrypts protected code in memory.
- **`nkx-run`:** the command that starts a protected app under the NakodaX runtime.
- **Licence:** a signed NakodaX key that allows a deployment to run protected code. It can be ended or rotated at any time.
- **Register token:** a one-time credential that registers a machine against a licence for one repository.
- **`.nkxc` file:** one source file's ciphertext.
- **Manifest (`.nkx/manifest.json`):** the list of protected files, with each file's wrapped key and hashes.

## Related

- [nkx-source-protection](https://github.com/nakodax/nkx-source-protection): the NakodaX Source Protection codebase, protected the same way
- [nkx-data-protection](https://github.com/nakodax/nkx-data-protection): NakodaX Data Pipelines, protected the same way
- [nkx-document-protection](https://github.com/nakodax/nkx-document-protection): NakodaX Document Protection, protected the same way
- [nkx-cli](https://github.com/nakodax/nkx-cli): the `nkx` command-line tool
- Runtime SDKs: [`nkx-runtime`](https://pypi.org/project/nkx-runtime/) (Python) and [`@nakodax/runtime`](https://www.npmjs.com/package/@nakodax/runtime) (Node.js)
- Website: [nakodax.com](https://nakodax.com) · Platform: [app.nakodax.com](https://app.nakodax.com) · Support: [nakodax.com/support](https://nakodax.com/support)

**About this snapshot.** This repository is published as a single squashed commit of a protected release (November 2026). Development history and individual commits are not included in public snapshots.

## Security and compliance

- **CSA STAR Level 1:** [listed on the CSA STAR Registry](https://cloudsecurityalliance.org/star/registry/nakodax-technologies-private-limited/services/nakodax), with our CAIQ answers public.
- **ISO/IEC 5230 and ISO/IEC 18974:** open source licence compliance and open source security assurance, [listed by OpenChain](https://openchainproject.org/community-of-conformance) ([announcement](https://openchainproject.org/news/2026/11/05/nakodax-announces-an-openchain-conformant-program)).
- **NIST CSF 2.0:** self-assessed alignment across all 22 categories, updated every quarter.
- **NIST SSDF (SP 800-218):** our software development practices are self-assessed against the Secure Software Development Framework.

Full details are on [nakodax.com/security](https://nakodax.com/security). For security documentation or a questionnaire, email security@nakodax.com.

## Security and licence

Found a problem? See [`SECURITY.md`](SECURITY.md). Evaluation licence: [`LICENSE`](LICENSE).

*Last updated: November 2026.*
