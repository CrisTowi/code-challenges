import { useEffect } from "react";
import type { Snapshot } from "@framework";
import { playSuccess, playFailure, ensureAudioRunning } from "@framework/audio";
import type { FulfilledOrdersBeforeFailureState } from "./algorithm";

const FLAVOR_COLORS: Record<string, string> = {
  vanilla: "#fff3b0",
  chocolate: "#8b4513",
  strawberry: "#ff79c6",
  mint: "#50fa7b",
  "rocky road": "#a89078",
  caramel: "#fab387",
  blueberry: "#8be9fd",
};
const DEFAULT_FLAVOR_COLOR = "#bd93f9";

const SCOOP_SIZE = 36;
const SCOOP_GAP = 6;
const CONE_WIDTH = 64;
const CONE_HEIGHT = 48;
const CONE_OVERLAP = 12;

const flavorColor = (flavor: string) => FLAVOR_COLORS[flavor] ?? DEFAULT_FLAVOR_COLOR;

type OrderStatus = "fulfilled" | "failed" | "pending";

interface ConeProps {
  flavors: string[];
  status: OrderStatus;
}

function Cone({ flavors, status }: ConeProps) {
  const stackHeight = (flavors.length - 1) * (SCOOP_SIZE - SCOOP_GAP) + SCOOP_SIZE;
  const totalHeight = stackHeight + CONE_HEIGHT - CONE_OVERLAP;

  const opacity = status === "pending" ? 0.5 : status === "failed" ? 0.55 : 1;

  return (
    <div
      style={{
        position: "relative",
        width: CONE_WIDTH,
        height: totalHeight,
        opacity,
        filter: status === "failed" ? "saturate(0.4)" : undefined,
        transition: "opacity 250ms ease, filter 250ms ease",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: stackHeight }}>
        {flavors.map((flavor, idx) => (
          <div
            key={idx}
            style={{
              position: "absolute",
              top: `${idx * (SCOOP_SIZE - SCOOP_GAP)}px`,
              left: "50%",
              transform: "translateX(-50%)",
              width: SCOOP_SIZE,
              height: SCOOP_SIZE,
              borderRadius: "50%",
              background: flavorColor(flavor),
              border: "2px solid #000",
              boxShadow: "inset 0 -5px 0 rgba(0,0,0,0.2)",
            }}
          />
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: CONE_HEIGHT,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: `${CONE_WIDTH / 2}px solid transparent`,
            borderRight: `${CONE_WIDTH / 2}px solid transparent`,
            borderTop: `${CONE_HEIGHT}px solid #d4a373`,
            filter: "drop-shadow(0 0 0.5px #000)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: `${CONE_WIDTH / 2 - 4}px solid transparent`,
            borderRight: `${CONE_WIDTH / 2 - 4}px solid transparent`,
            borderTop: `${CONE_HEIGHT - 4}px solid #f0d4a8`,
            opacity: 0.4,
          }}
        />
      </div>

      {status === "fulfilled" && (
        <div
          style={{
            position: "absolute",
            top: -10,
            right: -10,
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: "var(--sorted)",
            color: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-display)",
            fontSize: "0.7rem",
            border: "2px solid #000",
            boxShadow: "2px 2px 0 #000",
          }}
        >
          ✓
        </div>
      )}
      {status === "failed" && (
        <div
          style={{
            position: "absolute",
            top: -10,
            right: -10,
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: "var(--bar-compare)",
            color: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-display)",
            fontSize: "0.7rem",
            border: "2px solid #000",
            boxShadow: "2px 2px 0 #000",
          }}
        >
          ✗
        </div>
      )}
    </div>
  );
}

export function FulfilledOrdersBeforeFailureScene({
  snapshot,
}: {
  snapshot: Snapshot<FulfilledOrdersBeforeFailureState>;
}) {
  const { fulfilledOrders, orders, freezerStock } = snapshot.state;
  const isFail = snapshot.label === "noMoreIngredients";

  useEffect(() => {
    if (snapshot.label === "foundIngredient") {
      void ensureAudioRunning();
      playSuccess();
    } else if (snapshot.label === "noMoreIngredients") {
      void ensureAudioRunning();
      playFailure();
    }
  }, [snapshot]);

  const flavors = Object.keys(freezerStock).sort();

  const statusOf = (idx: number): OrderStatus => {
    if (idx < fulfilledOrders) return "fulfilled";
    if (idx === fulfilledOrders && isFail) return "failed";
    return "pending";
  };

  return (
    <div className="scene">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          minHeight: 480,
          padding: "0.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "1rem",
            borderBottom: "2px dashed var(--border)",
            paddingBottom: "0.5rem",
          }}
        >
          <span className="subtitle" style={{ margin: 0 }}>
            ▸ fulfilled
          </span>
          <span
            key={fulfilledOrders}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2rem",
              color: "var(--sorted)",
              textShadow: `0 0 12px var(--sorted)`,
              lineHeight: 1,
              animation: "pop 250ms ease",
            }}
          >
            {String(fulfilledOrders).padStart(2, "0")}
          </span>
          <span
            style={{
              color: "var(--text-dim)",
              fontFamily: "var(--font-display)",
              fontSize: "0.6rem",
            }}
          >
            / {orders.length} orders
          </span>
          <span
            style={{
              marginLeft: "auto",
              fontFamily: "var(--font-display)",
              fontSize: "0.55rem",
              padding: "0.3rem 0.6rem",
              background: isFail ? "var(--bar-compare)" : "var(--bg-elev)",
              color: isFail ? "#000" : "var(--text-dim)",
              border: `1px solid ${isFail ? "var(--bar-compare)" : "var(--border)"}`,
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            {isFail ? "✕ out of stock" : snapshot.label ?? "—"}
          </span>
        </div>

        <div style={{ borderBottom: "2px dashed var(--border)", paddingBottom: "0.5rem" }}>
          <span className="subtitle">▸ freezer</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
            {flavors.map((flavor) => {
              const stock = freezerStock[flavor];
              const empty = stock === 0;
              return (
                <div
                  key={flavor}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.35rem 0.7rem",
                    background: "var(--bg-elev)",
                    border: `2px solid ${empty ? "var(--bar-compare)" : "var(--border)"}`,
                    opacity: empty ? 0.55 : 1,
                    transition: "opacity 200ms ease, border-color 200ms ease",
                  }}
                >
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: flavorColor(flavor),
                      border: "1px solid #000",
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "1.1rem" }}>
                    {flavor}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.7rem",
                      color: empty ? "var(--bar-compare)" : "var(--text)",
                    }}
                  >
                    ×{stock}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <span className="subtitle">▸ order queue</span>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1.25rem",
              marginTop: "1rem",
              justifyContent: "center",
              alignItems: "flex-end",
            }}
          >
            {orders.map((order, idx) => (
              <div
                key={idx}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.6rem",
                    color: "var(--text-dim)",
                  }}
                >
                  #{idx + 1}
                </span>
                <Cone flavors={order} status={statusOf(idx)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
