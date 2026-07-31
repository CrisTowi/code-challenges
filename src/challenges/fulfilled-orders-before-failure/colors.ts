export const FLAVOR_COLORS: Record<string, string> = {
  vanilla: "#fff3b0",
  chocolate: "#8b4513",
  strawberry: "#ff79c6",
  mint: "#50fa7b",
  "rocky road": "#a89078",
  caramel: "#fab387",
  blueberry: "#8be9fd",
};

export const DEFAULT_FLAVOR_COLOR = "#bd93f9";

export function flavorColor(name: string): string {
  return FLAVOR_COLORS[name] ?? DEFAULT_FLAVOR_COLOR;
}