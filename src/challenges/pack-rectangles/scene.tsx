import type { Snapshot } from "@framework";
import type { PackRectanglesState } from "./algorithm";

export function PackRectanglesScene({ snapshot }: { snapshot: Snapshot<PackRectanglesState> }) {
  // TODO: render the state. Read snapshot.state and return JSX.
  // While developing, this dump is useful:
  return (
    <div className="scene" style={{ padding: "1rem", fontFamily: "monospace" }}>
      <pre>{JSON.stringify(snapshot.state, null, 2)}</pre>
    </div>
  );
}
