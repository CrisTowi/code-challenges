# Deterministic algorithms with optional seed

Algorithms must be deterministic — same input produces the same trace, byte-for-byte. The build-time baked trace and the client-side regen have to agree, and traces have to be shareable. If an algorithm needs randomness, the framework exposes a `seed` knob on the base class so the author can reach for a seeded RNG.

Non-deterministic algorithms would break the build-time / regen parity and make saved traces untrustworthy.