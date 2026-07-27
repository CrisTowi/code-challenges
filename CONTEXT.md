# code-challenges

A repo where we solve weekly code challenges and ship a didactic visualization of each algorithm alongside the solution.

## Language

**Challenge**: A weekly code problem solved in this repo. Each challenge has a single algorithm and a single visualization.

**Algorithm**: The implementation of a challenge's solution. A self-contained class that runs to completion and exposes its state at checkpoints.

**Trace**: The recorded sequence of state snapshots captured during a single run of an algorithm on a single input.

**Snapshot**: One state at one moment in the algorithm's execution. The unit of the trace.

**Scene**: The per-challenge visualization component. Consumes a trace and renders each snapshot in a way that's idiomatic to that algorithm — a tree for tree algorithms, a sorted chart for sorting, a grid for pathfinding, etc.

**Player**: The shared scrubber UI that drives a scene. Provides play, pause, step, and speed controls. Algorithm-agnostic.

**Example**: A hand-picked input paired with a name. The author picks 2–4 per challenge to surface the interesting cases (small, large, edge, pathological).

**Regen**: A client-side re-run of the algorithm with a chosen example. Lets the viewer see the same algorithm trace over a different input without re-building.

**Framework**: The shared plumbing between algorithm and scene. Owns the trace format, the snapshot mechanism, and the player. Knows nothing about any specific algorithm.