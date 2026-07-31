import { useEffect } from "react";
import type { Snapshot } from "@framework";
import { playSuccess, playFailure, ensureAudioRunning } from "@framework/audio";
import type { FulfilledOrdersBeforeFailureState } from "./algorithm";
import { flavorColor } from "./colors";
import styles from "./scene.module.css";

const SCOOP_SIZE = 36;
const SCOOP_GAP = 6;
const CONE_WIDTH = 64;
const CONE_HEIGHT = 48;
const CONE_OVERLAP = 12;

const SCOOP_STRIDE = SCOOP_SIZE - SCOOP_GAP;

type OrderStatus = "fulfilled" | "failed" | "pending";

interface ConeProps {
  flavors: string[];
  status: OrderStatus;
}

function Cone({ flavors, status }: ConeProps) {
  const stackHeight = (flavors.length - 1) * SCOOP_STRIDE + SCOOP_SIZE;
  const totalHeight = stackHeight + CONE_HEIGHT - CONE_OVERLAP;

  const outerClass = [
    styles.coneOuter,
    status === "pending" ? styles.coneOuterPending : "",
    status === "failed" ? styles.coneOuterFailed : "",
  ]
    .filter(Boolean)
    .join(" ");

  const innerClass = [
    styles.coneInner,
    status === "fulfilled" ? styles.coneInnerFulfilled : "",
    status === "failed" ? styles.coneInnerFailed : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={outerClass}
      style={
        {
          "--cone-width": `${CONE_WIDTH}px`,
          "--cone-height": `${totalHeight}px`,
        } as React.CSSProperties
      }
    >
      <div className={innerClass}>
        <div className={styles.scoopsStack} style={{ "--stack-height": `${stackHeight}px` } as React.CSSProperties}>
          {flavors.map((flavor, idx) => (
            <div
              key={idx}
              className={styles.scoop}
              style={
                {
                  "--scoop-index": idx,
                  "--scoop-color": flavorColor(flavor),
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        <div className={styles.coneBottom}>
          <div className={styles.coneOuterTriangle} />
          <div className={styles.coneInnerTriangle} />
        </div>

        {status === "fulfilled" && (
          <div className={`${styles.badge} ${styles.badgeFulfilled}`}>✓</div>
        )}
        {status === "failed" && (
          <div className={`${styles.badge} ${styles.badgeFailed}`}>✗</div>
        )}
      </div>
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
      <div className={styles.sceneContent}>
        <div className={styles.counterRow}>
          <span className="subtitle" style={{ margin: 0 }}>
            ▸ fulfilled
          </span>
          <span key={fulfilledOrders} className={styles.counterValue}>
            {String(fulfilledOrders).padStart(2, "0")}
          </span>
          <span className={styles.counterCounter}>
            / {orders.length} orders
          </span>
          <span
            className={`${styles.statusPill} ${isFail ? styles.statusPillFailure : ""}`}
          >
            {isFail ? "✕ out of stock" : snapshot.label ?? "—"}
          </span>
        </div>

        <div className={styles.freezerSection}>
          <span className="subtitle">▸ freezer</span>
          <div className={styles.freezerGrid}>
            {flavors.map((flavor) => {
              const stock = freezerStock[flavor];
              const empty = stock === 0;
              return (
                <div
                  key={flavor}
                  className={`${styles.freezerChip} ${empty ? styles.freezerChipEmpty : ""}`}
                >
                  <span
                    className={styles.freezerSwatch}
                    style={{ "--swatch-color": flavorColor(flavor) } as React.CSSProperties}
                  />
                  <span className={styles.freezerName}>{flavor}</span>
                  <span
                    className={`${styles.freezerCount} ${empty ? styles.freezerCountEmpty : ""}`}
                  >
                    ×{stock}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.ordersSection}>
          <span className="subtitle">▸ order queue</span>
          <div className={styles.ordersGrid}>
            {orders.map((order, idx) => (
              <div key={idx} className={styles.orderItem}>
                <span className={styles.orderIndex}>#{idx + 1}</span>
                <Cone flavors={order} status={statusOf(idx)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}