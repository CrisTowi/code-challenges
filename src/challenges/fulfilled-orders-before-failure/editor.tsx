import { useState } from "react";
import type { FulfilledOrdersBeforeFailureInput } from "./algorithm";
import { flavorColor } from "./colors";
import styles from "./editor.module.css";

interface EditorProps {
  initial: FulfilledOrdersBeforeFailureInput;
  onRun: (input: FulfilledOrdersBeforeFailureInput) => void;
}

export function FulfilledOrdersBeforeFailureEditor({ initial, onRun }: EditorProps) {
  const [freezerStock, setFreezerStock] = useState<Record<string, number>>(
    { ...initial.freezerStock },
  );
  const [orders, setOrders] = useState<string[][]>(initial.orders.map((o) => [...o]));
  const [newFlavor, setNewFlavor] = useState({ name: "", stock: 1 });
  const [addToOrder, setAddToOrder] = useState<Record<number, string>>({});
  const [newOrderFlavor, setNewOrderFlavor] = useState("");

  const adjustStock = (name: string, delta: number) => {
    setFreezerStock((prev) => ({
      ...prev,
      [name]: Math.max(0, (prev[name] ?? 0) + delta),
    }));
  };

  const removeFlavor = (name: string) => {
    setFreezerStock((prev) => {
      const { [name]: _, ...rest } = prev;
      return rest;
    });
  };

  const addFlavor = () => {
    const name = newFlavor.name.trim();
    if (!name) return;
    setFreezerStock((prev) => ({ ...prev, [name]: Math.max(0, newFlavor.stock) }));
    setNewFlavor({ name: "", stock: 1 });
  };

  const removeOrder = (idx: number) => {
    setOrders((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeFlavorFromOrder = (orderIdx: number, flavorIdx: number) => {
    setOrders((prev) =>
      prev.map((order, i) =>
        i === orderIdx ? order.filter((_, j) => j !== flavorIdx) : order,
      ),
    );
  };

  const addFlavorToOrder = (orderIdx: number) => {
    const flavor = addToOrder[orderIdx];
    if (!flavor) return;
    setOrders((prev) =>
      prev.map((order, i) => (i === orderIdx ? [...order, flavor] : order)),
    );
    setAddToOrder((prev) => ({ ...prev, [orderIdx]: "" }));
  };

  const addOrder = () => {
    if (!newOrderFlavor) return;
    setOrders((prev) => [...prev, [newOrderFlavor]]);
    setNewOrderFlavor("");
  };

  const handleRun = () => {
    onRun({ orders: orders.map((o) => [...o]), freezerStock: { ...freezerStock } });
  };

  const flavorNames = Object.keys(freezerStock).sort();

  return (
    <div>
      <div className="subtitle">▸ build scenario</div>

      <div className={styles.editor}>
        <div className={`${styles.subtitleSmall} ${styles.subtitleFirst}`}>freezer</div>
        <div className={styles.row}>
          {flavorNames.length === 0 ? (
            <div className={styles.empty}>empty — add a flavor below</div>
          ) : (
            flavorNames.map((name) => {
              const stock = freezerStock[name];
              const empty = stock === 0;
              return (
                <div
                  key={name}
                  className={`${styles.flavorRow} ${empty ? styles.flavorRowEmpty : ""}`}
                >
                  <span
                    className={styles.flavorSwatch}
                    style={{ "--swatch-color": flavorColor(name) } as React.CSSProperties}
                  />
                  <span className={styles.flavorName}>{name}</span>
                  <span
                    className={`${styles.flavorCount} ${empty ? styles.flavorCountEmpty : ""}`}
                  >
                    ×{stock}
                  </span>
                  <button className={styles.iconBtn} onClick={() => adjustStock(name, -1)}>
                    −
                  </button>
                  <button className={styles.iconBtn} onClick={() => adjustStock(name, 1)}>
                    +
                  </button>
                  <button
                    className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                    onClick={() => removeFlavor(name)}
                  >
                    ×
                  </button>
                </div>
              );
            })
          )}
        </div>
        <div className={styles.rowInline}>
          <input
            className={styles.input}
            value={newFlavor.name}
            placeholder="flavor name"
            onChange={(e) => setNewFlavor({ ...newFlavor, name: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") addFlavor();
            }}
          />
          <input
            className={`${styles.input} ${styles.inputSmall}`}
            type="number"
            min={0}
            value={newFlavor.stock}
            onChange={(e) => setNewFlavor({ ...newFlavor, stock: Number(e.target.value) })}
          />
          <button className="btn btn--icon" onClick={addFlavor}>
            + add
          </button>
        </div>

        <div className={`${styles.subtitleSmall} ${styles.subtitleWithTopMargin}`}>
          order queue
        </div>
        <div className={styles.row}>
          {orders.length === 0 ? (
            <div className={styles.empty}>empty — add an order below</div>
          ) : (
            orders.map((order, idx) => (
              <div key={idx} className={styles.orderRow}>
                <span className={styles.orderIndex}>#{idx + 1}</span>
                {order.length === 0 ? (
                  <span className={styles.muted}>(no flavors)</span>
                ) : (
                  order.map((flavor, fIdx) => (
                    <span key={fIdx} className={styles.orderChip}>
                      <span
                        className={styles.orderChipSwatch}
                        style={{ "--swatch-color": flavorColor(flavor) } as React.CSSProperties}
                      />
                      {flavor}
                      <button
                        className={styles.orderChipRemove}
                        onClick={() => removeFlavorFromOrder(idx, fIdx)}
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
                {flavorNames.length > 0 && (
                  <>
                    <select
                      className={`${styles.select} ${styles.selectSmall}`}
                      value={addToOrder[idx] ?? ""}
                      onChange={(e) =>
                        setAddToOrder((prev) => ({ ...prev, [idx]: e.target.value }))
                      }
                    >
                      <option value="">+ flavor</option>
                      {flavorNames.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                    <button
                      className={styles.iconBtn}
                      onClick={() => addFlavorToOrder(idx)}
                      disabled={!addToOrder[idx]}
                    >
                      +
                    </button>
                  </>
                )}
                <button
                  className={`${styles.iconBtn} ${styles.iconBtnDanger} ${styles.iconBtnRemove}`}
                  onClick={() => removeOrder(idx)}
                >
                  remove
                </button>
              </div>
            ))
          )}
        </div>
        <div className={styles.rowInline}>
          <select
            className={styles.select}
            value={newOrderFlavor}
            onChange={(e) => setNewOrderFlavor(e.target.value)}
            disabled={flavorNames.length === 0}
          >
            <option value="">
              {flavorNames.length === 0 ? "add a flavor first" : "+ first flavor"}
            </option>
            {flavorNames.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <button className="btn btn--icon" onClick={addOrder} disabled={!newOrderFlavor}>
            + order
          </button>
        </div>

        <div className={styles.runRow}>
          <button className="btn btn--primary" onClick={handleRun}>
            ▸ run scenario
          </button>
        </div>
      </div>
    </div>
  );
}