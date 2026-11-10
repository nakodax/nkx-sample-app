# Security policy

## Reporting a vulnerability

Email **support@nakodax.com** with the subject `Security: nkx-sample-app`. Include what
you found, how to reproduce it, and how to reach you. Please do not open a public issue
for a security report.

## What counts

- Decrypting the files in `python/ledgerlens/` or `node/ledgerlens/` without a valid
  key, or after the key has been disabled.
- Getting app.nakodax.com to release a decryption key for a disabled, expired or forged
  key, or for a different project.
- Anything that makes the NakodaX runtime write decrypted code to disk.

## What does not

- "Someone running the app with a valid key can read the code in memory." Code that
  runs on your machine is in your machine's memory; NakodaX controls who can start it
  and for how long. That is the model this sample demonstrates.
- Using the public trial key. It is public on purpose.
- Brute-forcing the ciphertext in this repository.
