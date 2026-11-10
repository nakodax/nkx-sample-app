# Public trial key

The files in this folder are a **shared evaluation key** for this repository, committed
on purpose so that anyone can unlock the sample app:

| File | What it is | What it can do |
|---|---|---|
| `license.key` | the trial licence, signed by NakodaX | unlock this sample app only |
| `register.token` | a registration token for this repository | register a machine for this sample app, and nothing else |

They are not secrets. They cannot unlock any other NakodaX protected repository, and
they cannot read or change anything else in NakodaX. NakodaX checks the licence online
on every run, can switch it off at any time, and it expires on 9 March 2027.

Each machine that registers is recorded in NakodaX Core with a machine ID, the IP address it
connected from, and the time of its last check-in.

How to use them: see "Try it in 60 seconds" in the [README](../README.md#try-it-in-60-seconds).
