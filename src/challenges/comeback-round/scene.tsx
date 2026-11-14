import type { Snapshot } from "@framework";
import type { ComebackRoundState } from "./algorithm";

export function ComebackRoundScene({ snapshot }: { snapshot: Snapshot<ComebackRoundState> }) {
  // TODO: render the state. Read snapshot.state and return JSX.
  // While developing, this dump is useful:
  return (
    <div className="scene" style={{ padding: "1rem", fontFamily: "monospace" }}>
      <pre>{JSON.stringify(snapshot.state, null, 2)}</pre>
    </div>
  );
}
