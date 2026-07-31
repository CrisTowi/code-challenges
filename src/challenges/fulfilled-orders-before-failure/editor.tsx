import { useState } from "react";
import type { FulfilledOrdersBeforeFailureInput } from "./algorithm";
import { flavorColor } from "./colors";

interface EditorProps {
  initial: FulfilledOrdersBeforeFailureInput;
  onRun: (input: FulfilledOrdersBeforeFailureInput) => void;
}

const inputStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: "1rem",
  background: "var(--bg-elev)",
  color: "var(--text)",
  border: "2px solid var(--border)",
  padding: "0.35rem 0.55rem",
  outline: "none",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  fontFamily: "var(--font-display)",
  fontSize: "0.55rem",
  textTransform: "uppercase",
  cursor: "pointer",
};

const chipStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.4rem",
  padding: "0.3rem 0.6rem",
  background: "var(--bg-elev)",
  border: "2px solid var(--border)",
  fontFamily: "var(--font-body)",
  fontSize: "1rem",
};

const iconBtnStyle: React.CSSProperties = {
  padding: "0.2rem 0.5rem",
  background: "var(--bg-panel)",
  color: "var(--text)",
  border: "1px solid var(--border)",
  fontFamily: "var(--font-display)",
  fontSize: "0.6rem",
  cursor: "pointer",
};

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

      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        <div className="subtitle" style={{ margin: 0, fontSize: "0.55rem" }}>
          freezer
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          {flavorNames.length === 0 ? (
            <div className="muted" style={{ fontSize: "0.9rem" }}>
              empty — add a flavor below
            </div>
          ) : (
            flavorNames.map((name) => {
              const stock = freezerStock[name];
              const empty = stock === 0;
              return (
                <div
                  key={name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.4rem 0.6rem",
                    background: "var(--bg-elev)",
                    border: `2px solid ${empty ? "var(--bar-compare)" : "var(--border)"}`,
                    opacity: empty ? 0.6 : 1,
                  }}
                >
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: flavorColor(name),
                      border: "1px solid #000",
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ minWidth: "7rem" }}>{name}</span>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.6rem",
                      color: empty ? "var(--bar-compare)" : "var(--text)",
                      minWidth: "2.5rem",
                    }}
                  >
                    ×{stock}
                  </span>
                  <button style={iconBtnStyle} onClick={() => adjustStock(name, -1)}>
                    −
                  </button>
                  <button style={iconBtnStyle} onClick={() => adjustStock(name, 1)}>
                    +
                  </button>
                  <button
                    style={{ ...iconBtnStyle, color: "var(--bar-compare)" }}
                    onClick={() => removeFlavor(name)}
                  >
                    ×
                  </button>
                </div>
              );
            })
          )}
        </div>
        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap" }}>
          <input
            style={{ ...inputStyle, flex: "1 1 8rem", minWidth: "8rem" }}
            value={newFlavor.name}
            placeholder="flavor name"
            onChange={(e) => setNewFlavor({ ...newFlavor, name: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") addFlavor();
            }}
          />
          <input
            style={{ ...inputStyle, width: "4rem" }}
            type="number"
            min={0}
            value={newFlavor.stock}
            onChange={(e) => setNewFlavor({ ...newFlavor, stock: Number(e.target.value) })}
          />
          <button className="btn btn--icon" onClick={addFlavor}>
            + add
          </button>
        </div>

        <div className="subtitle" style={{ margin: "0.4rem 0 0 0", fontSize: "0.55rem" }}>
          order queue
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          {orders.length === 0 ? (
            <div className="muted" style={{ fontSize: "0.9rem" }}>
              empty — add an order below
            </div>
          ) : (
            orders.map((order, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.4rem 0.6rem",
                  background: "var(--bg-elev)",
                  border: "2px solid var(--border)",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.6rem",
                    color: "var(--text-dim)",
                    minWidth: "1.6rem",
                  }}
                >
                  #{idx + 1}
                </span>
                {order.length === 0 ? (
                  <span className="muted" style={{ fontSize: "0.9rem" }}>
                    (no flavors)
                  </span>
                ) : (
                  order.map((flavor, fIdx) => (
                    <span key={fIdx} style={chipStyle}>
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: flavorColor(flavor),
                          border: "1px solid #000",
                        }}
                      />
                      {flavor}
                      <button
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "var(--bar-compare)",
                          cursor: "pointer",
                          fontFamily: "var(--font-display)",
                          fontSize: "0.7rem",
                          padding: 0,
                        }}
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
                      style={{ ...selectStyle, minWidth: "7rem" }}
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
                      style={iconBtnStyle}
                      onClick={() => addFlavorToOrder(idx)}
                      disabled={!addToOrder[idx]}
                    >
                      +
                    </button>
                  </>
                )}
                <button
                  style={{ ...iconBtnStyle, color: "var(--bar-compare)", marginLeft: "auto" }}
                  onClick={() => removeOrder(idx)}
                >
                  remove
                </button>
              </div>
            ))
          )}
        </div>
        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
          <select
            style={{ ...selectStyle, flex: "1 1 auto", minWidth: "8rem" }}
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

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
          <button className="btn btn--primary" onClick={handleRun}>
            ▸ run scenario
          </button>
        </div>
      </div>
    </div>
  );
}