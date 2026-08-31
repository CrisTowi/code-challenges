import type { Snapshot } from "@framework";
import type { ClimbStairsState } from "./algorithm";

export function ClimbStairsScene({ snapshot }: { snapshot: Snapshot<ClimbStairsState> }) {
  // TODO: render the state. Read snapshot.state and return JSX.
  // While developing, this dump is useful:
  return (
    <div className="scene" style={{ padding: "1rem", fontFamily: "monospace" }}>
      <pre>{JSON.stringify(snapshot.state, null, 2)}</pre>
    </div>
  );
}
