# State snapshots as the trace shape

The trace is a sequence of full state snapshots, not a stream of events. The algorithm author marks checkpoints by calling `snapshot()` at interesting moments; the framework records the full state at each checkpoint. The state is captured whole (not a viz-relevant projection) so the algorithm doesn't know what the visualization will use — the scene derives whatever it needs from the full state.

Considered options: event streams (smaller, replayable, but each scene has to reconstruct state from primitives) and viz-relevant projections (smaller still, but the algorithm leaks viz concerns into its state shape). Full state snapshots sit in the middle: the trace is local to each run, and the algorithm stays clean.

Surprising without context: implementing a tree reverse by reconstructing tree shape from a stream of `mark node X visited` events is work that doesn't belong in the algorithm or the scene.