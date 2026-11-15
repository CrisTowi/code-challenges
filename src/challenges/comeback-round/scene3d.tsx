import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Edges, OrbitControls, Stars } from "@react-three/drei";
import { Bloom, ChromaticAberration, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import type { ComebackRoundState } from "./algorithm";
import { driverOf, kartColor, kartName, type Driver, type Mood } from "./hud";
import styles from "./scene.module.css";

// ─── layout constants ────────────────────────────────────────────────────────

const L = 20; // track length (start line at x = 0, finish at x = L)
const LANE = 1.6; // lane spacing on z
const PODIUM_X = L + 5;
const STEP_H = [1.2, 0.8, 0.5]; // 1st, 2nd, 3rd
const STEP_Z = [0, -1.9, 1.9];

const laneZ = (k: number, players: number) => (k - (players - 1) / 2) * LANE;

export interface Stage3DProps {
  totals: number[];
  trackMax: number;
  phase: ComebackRoundState["phase"];
  index: number | null;
  /** Sole leader, or null when the lead is shared / at the start. */
  leader: number | null;
  /** Kart the replay is checking. */
  checked: number | null;
  roundPoints: number[] | null;
  /** Kart indices sorted by total, best first. */
  order: number[];
  /** How each driver feels this step (cheer / sad / race). */
  moods: Mood[];
  lowFx: boolean;
}

// ─── textures (drawn once on a canvas) ───────────────────────────────────────

function canvasTexture(size: number, draw: (ctx: CanvasRenderingContext2D, s: number) => void) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  draw(c.getContext("2d")!, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function useGridTexture() {
  const gl = useThree((s) => s.gl);
  return useMemo(() => {
    const tex = canvasTexture(128, (ctx, s) => {
      ctx.fillStyle = "#0a0418";
      ctx.fillRect(0, 0, s, s);
      ctx.strokeStyle = "#e879f9";
      ctx.lineWidth = 4;
      ctx.strokeRect(0, 0, s, s);
      ctx.strokeStyle = "rgba(34,211,238,0.55)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(s / 2, 0);
      ctx.lineTo(s / 2, s);
      ctx.moveTo(0, s / 2);
      ctx.lineTo(s, s / 2);
      ctx.stroke();
    });
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(60, 60);
    tex.anisotropy = gl.capabilities.getMaxAnisotropy();
    return tex;
  }, [gl]);
}

function useCheckerTexture(repeatX: number, repeatY: number) {
  return useMemo(() => {
    const tex = canvasTexture(64, (ctx, s) => {
      const h = s / 2;
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = "#0b0820";
      ctx.fillRect(0, 0, h, h);
      ctx.fillRect(h, h, h, h);
    });
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
    tex.magFilter = THREE.NearestFilter;
    return tex;
  }, [repeatX, repeatY]);
}

function useSunTexture() {
  return useMemo(
    () =>
      canvasTexture(256, (ctx, s) => {
        const g = ctx.createLinearGradient(0, 0, 0, s);
        g.addColorStop(0, "#fde047");
        g.addColorStop(0.55, "#fb7185");
        g.addColorStop(1, "#c026d3");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(s / 2, s / 2, s / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
        // horizontal cut bands, thicker toward the bottom
        ctx.globalCompositeOperation = "destination-out";
        for (let i = 0; i < 6; i++) {
          const y = s * (0.55 + i * 0.075);
          ctx.fillRect(0, y, s, 3 + i * 2.2);
        }
      }),
    [],
  );
}

// ─── world ───────────────────────────────────────────────────────────────────

function Floor({ direction }: { direction: number }) {
  const tex = useGridTexture();
  useFrame((_, dt) => {
    tex.offset.x += direction * dt * 1.6;
  });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[L / 2, -0.02, 0]}>
      <planeGeometry args={[240, 240]} />
      <meshBasicMaterial map={tex} />
    </mesh>
  );
}

function Scenery() {
  const sun = useSunTexture();
  const peaks = useMemo(() => {
    const out: { x: number; z: number; h: number; r: number }[] = [];
    for (let i = 0; i < 26; i++) {
      const far = i % 2 === 0;
      out.push({
        x: far ? L + 34 + ((i * 7) % 9) : -30 - ((i * 5) % 8),
        z: -48 + ((i * 37) % 96),
        h: 6 + ((i * 13) % 9),
        r: 5 + ((i * 11) % 5),
      });
    }
    return out;
  }, []);
  return (
    <>
      <Stars radius={120} depth={40} count={1400} factor={3} fade speed={0.6} />
      <mesh position={[L + 70, 9, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[34, 34]} />
        <meshBasicMaterial map={sun} transparent toneMapped={false} fog={false} />
      </mesh>
      {peaks.map((p, i) => (
        <mesh key={i} position={[p.x, p.h / 2 - 0.1, p.z]}>
          <coneGeometry args={[p.r, p.h, 4]} />
          <meshStandardMaterial color="#1e0b3a" flatShading />
          <Edges color="#e879f9" />
        </mesh>
      ))}
    </>
  );
}

function Track({ players }: { players: number }) {
  const span = players * LANE;
  const checker = useCheckerTexture(1, players * 3);
  const banner = useCheckerTexture(players * 3, 1);
  return (
    <group>
      {Array.from({ length: players }, (_, k) => {
        const z = laneZ(k, players);
        const color = kartColor(k);
        return (
          <group key={k} position={[0, 0, z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[L / 2, 0, 0]}>
              <planeGeometry args={[L + 4, LANE * 0.9]} />
              <meshStandardMaterial color="#0b0820" transparent opacity={0.88} />
            </mesh>
            {[-1, 1].map((side) => (
              <mesh key={side} position={[L / 2, 0.02, side * LANE * 0.45]}>
                <boxGeometry args={[L + 4, 0.03, 0.05]} />
                <meshBasicMaterial color={color} toneMapped={false} />
              </mesh>
            ))}
          </group>
        );
      })}
      {/* start line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <planeGeometry args={[0.12, span]} />
        <meshBasicMaterial color="#f8fafc" />
      </mesh>
      {/* finish line + gate */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[L + 0.9, 0.03, 0]}>
        <planeGeometry args={[0.5, span]} />
        <meshBasicMaterial map={checker} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[L + 0.9, 1.5, side * (span / 2 + 0.3)]}>
          <boxGeometry args={[0.18, 3, 0.18]} />
          <meshBasicMaterial color="#e879f9" toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[L + 0.9, 2.8, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[span + 0.6, 0.5]} />
        <meshBasicMaterial map={banner} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ─── driver: animal mascot built from primitives, facing +X ─────────────────

const INK = "#0b0820";

function Eyes3D({ mood, light, x = 0.19, y = 0.03, z = 0.075 }: { mood: Mood; light?: boolean; x?: number; y?: number; z?: number }) {
  const squash: [number, number, number] = mood === "cheer" ? [1, 0.3, 1.3] : mood === "sad" ? [1, 0.45, 1.2] : [1, 1, 1];
  const color = light ? "#f8fafc" : INK;
  return (
    <>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[x, mood === "sad" ? y - 0.015 : y, side * z]} scale={squash}>
          <sphereGeometry args={[0.035, 10, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
      {mood === "sad" && (
        <mesh position={[x + 0.01, y - 0.08, z]}>
          <sphereGeometry args={[0.022, 8, 6]} />
          <meshBasicMaterial color="#60a5fa" toneMapped={false} />
        </mesh>
      )}
    </>
  );
}

function Goggles3D() {
  return (
    <group position={[0, 0.09, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.224, 0.022, 8, 28]} />
        <meshStandardMaterial color={INK} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[0.21, 0.01, side * 0.075]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.055, 0.055, 0.03, 16]} />
          <meshBasicMaterial color="#22d3ee" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/** Head features per animal, in head-local space (radius ≈ 0.22). */
function Head3D({ driver, mood }: { driver: Driver; mood: Mood }) {
  const { animal, fur, accent } = driver;
  const furMat = <meshStandardMaterial color={fur} roughness={0.75} />;
  const accentMat = <meshStandardMaterial color={accent} roughness={0.75} />;
  const head = (scale: [number, number, number] = [1, 1, 1]) => (
    <mesh scale={scale}>
      <sphereGeometry args={[0.22, 20, 16]} />
      {furMat}
    </mesh>
  );
  const pointyEars = (r: number, h: number, inner?: boolean) =>
    [-1, 1].map((side) => (
      <group key={side} position={[-0.01, 0.2, side * 0.11]} rotation={[side * 0.35, 0, 0]}>
        <mesh>
          <coneGeometry args={[r, h, 4]} />
          {furMat}
        </mesh>
        {inner && (
          <mesh position={[0.02, -0.01, 0]} scale={[0.5, 0.7, 0.5]}>
            <coneGeometry args={[r, h, 4]} />
            {accentMat}
          </mesh>
        )}
      </group>
    ));

  switch (animal) {
    case "fox":
      return (
        <group>
          {head()}
          {pointyEars(0.075, 0.18, true)}
          <mesh position={[0.25, -0.05, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.09, 0.2, 10]} />
            {accentMat}
          </mesh>
          <mesh position={[0.35, -0.05, 0]}>
            <sphereGeometry args={[0.03, 8, 6]} />
            <meshBasicMaterial color={INK} />
          </mesh>
          <Goggles3D />
          <Eyes3D mood={mood} />
        </group>
      );
    case "cat":
      return (
        <group>
          {head()}
          {pointyEars(0.08, 0.15, true)}
          {[-1, 1].map((side) =>
            [-0.03, -0.06].map((y) => (
              <mesh key={`${side}${y}`} position={[0.25, y, side * 0.09]} rotation={[0, side * 0.35, 0]}>
                <boxGeometry args={[0.2, 0.006, 0.006]} />
                <meshBasicMaterial color={INK} />
              </mesh>
            )),
          )}
          <mesh position={[0.22, -0.02, 0]}>
            <sphereGeometry args={[0.026, 8, 6]} />
            <meshBasicMaterial color="#f472b6" />
          </mesh>
          <Goggles3D />
          <Eyes3D mood={mood} />
        </group>
      );
    case "frog":
      return (
        <group>
          {head([1.1, 0.82, 1.18])}
          {[-1, 1].map((side) => (
            <group key={side} position={[0.07, 0.16, side * 0.1]}>
              <mesh>
                <sphereGeometry args={[0.085, 14, 10]} />
                {furMat}
              </mesh>
              <mesh position={[0.05, 0.02, 0]}>
                <sphereGeometry args={[0.058, 12, 8]} />
                <meshStandardMaterial color="#ffffff" />
              </mesh>
            </group>
          ))}
          <Eyes3D mood={mood} x={0.18} y={0.18} z={0.1} />
          <mesh position={[0.215, mood === "sad" ? -0.07 : -0.05, 0]} rotation={[mood === "sad" ? 0 : 0, 0, 0]}>
            <boxGeometry args={[0.01, 0.014, 0.24]} />
            <meshBasicMaterial color={INK} />
          </mesh>
        </group>
      );
    case "panda":
      return (
        <group>
          {head()}
          {[-1, 1].map((side) => (
            <group key={side}>
              <mesh position={[-0.02, 0.19, side * 0.14]}>
                <sphereGeometry args={[0.07, 12, 8]} />
                {accentMat}
              </mesh>
              <mesh position={[0.17, 0.02, side * 0.08]} scale={[0.6, 1.1, 1]}>
                <sphereGeometry args={[0.06, 12, 8]} />
                {accentMat}
              </mesh>
            </group>
          ))}
          <mesh position={[0.22, -0.06, 0]}>
            <sphereGeometry args={[0.032, 8, 6]} />
            {accentMat}
          </mesh>
          <Goggles3D />
          <Eyes3D mood={mood} light x={0.205} />
        </group>
      );
    case "owl":
      return (
        <group>
          {head()}
          {[-1, 1].map((side) => (
            <group key={side}>
              <mesh position={[-0.01, 0.22, side * 0.12]} rotation={[side * 0.6, 0, 0]}>
                <coneGeometry args={[0.05, 0.15, 4]} />
                {furMat}
              </mesh>
              <mesh position={[0.17, 0.03, side * 0.08]} scale={[0.45, 1, 1]}>
                <sphereGeometry args={[0.07, 14, 10]} />
                {accentMat}
              </mesh>
            </group>
          ))}
          <mesh position={[0.23, -0.05, 0]} rotation={[0, 0, -Math.PI / 2 - 0.5]}>
            <coneGeometry args={[0.035, 0.1, 4]} />
            <meshStandardMaterial color="#f97316" />
          </mesh>
          <Eyes3D mood={mood} x={0.205} />
        </group>
      );
    case "bunny":
      return (
        <group>
          {head()}
          {[-1, 1].map((side) => (
            <group key={side} position={[-0.04, 0.34, side * 0.07]} rotation={[side * 0.18, 0, 0.28]}>
              <mesh>
                <capsuleGeometry args={[0.045, 0.24, 4, 10]} />
                {furMat}
              </mesh>
              <mesh position={[0.03, 0, 0]} scale={[0.4, 0.85, 0.55]}>
                <capsuleGeometry args={[0.045, 0.24, 4, 10]} />
                {accentMat}
              </mesh>
            </group>
          ))}
          <mesh position={[0.22, -0.03, 0]}>
            <sphereGeometry args={[0.028, 8, 6]} />
            <meshBasicMaterial color="#f472b6" />
          </mesh>
          <Goggles3D />
          <Eyes3D mood={mood} />
        </group>
      );
    case "shark":
      return (
        <group>
          {head()}
          <mesh position={[-0.07, 0.25, 0]} rotation={[0, 0, 0.4]}>
            <coneGeometry args={[0.09, 0.24, 3]} />
            {furMat}
          </mesh>
          <mesh position={[0.05, -0.08, 0]} scale={[1, 0.6, 0.95]}>
            <sphereGeometry args={[0.2, 16, 10]} />
            {accentMat}
          </mesh>
          <mesh position={[0.2, -0.085, 0]}>
            <boxGeometry args={[0.012, 0.028, 0.18]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <Goggles3D />
          <Eyes3D mood={mood} />
        </group>
      );
    case "bot":
      return (
        <group>
          <mesh>
            <boxGeometry args={[0.38, 0.34, 0.38]} />
            <meshStandardMaterial color={fur} metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0.192, 0.02, 0]}>
            <boxGeometry args={[0.01, 0.13, 0.3]} />
            <meshBasicMaterial color={INK} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[0.2, 0.02, side * 0.07]} scale={mood === "race" ? [1, 1, 1] : [1, 0.35, 1]}>
              <boxGeometry args={[0.012, 0.06, 0.07]} />
              <meshBasicMaterial color={mood === "sad" ? "#f87171" : accent} toneMapped={false} />
            </mesh>
          ))}
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.16, 6]} />
            <meshStandardMaterial color={INK} />
          </mesh>
          <mesh position={[0, 0.34, 0]}>
            <sphereGeometry args={[0.035, 10, 8]} />
            <meshBasicMaterial color="#f472b6" toneMapped={false} />
          </mesh>
        </group>
      );
  }
}

/** Driver = torso + arms on the wheel + animal head + scarf. Animated by mood. */
function Driver3D({ driver, color, mood }: { driver: Driver; color: string; mood: Mood }) {
  const head = useRef<THREE.Group>(null);
  const arms = useRef<(THREE.Group | null)[]>([]);
  const scarf = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const k = 1 - Math.exp(-dt * 8);
    const h = head.current;
    if (h) {
      const tz = mood === "cheer" ? 0.25 : mood === "sad" ? -0.32 : -0.1 + Math.sin(t * 6) * 0.03;
      const ty = mood === "sad" ? Math.sin(t * 9) * 0.45 : 0;
      const py = 0.42 + (mood === "cheer" ? Math.abs(Math.sin(t * 8)) * 0.06 : Math.sin(t * 14) * 0.008);
      h.rotation.z += (tz - h.rotation.z) * k;
      h.rotation.y += (ty - h.rotation.y) * k;
      h.position.y += (py - h.position.y) * k;
    }
    arms.current.forEach((a, i) => {
      if (!a) return;
      const side = i === 0 ? -1 : 1;
      const tz = mood === "cheer" ? 2.0 + Math.sin(t * 10 + side) * 0.25 : mood === "sad" ? -0.85 : -0.45;
      const tx = mood === "cheer" ? side * 0.35 : 0;
      a.rotation.z += (tz - a.rotation.z) * k;
      a.rotation.x += (tx - a.rotation.x) * k;
    });
    scarf.current.forEach((m, i) => {
      if (!m) return;
      const amp = mood === "sad" ? 0.01 : 0.03 * (1 + i * 0.6);
      m.position.y = 0.3 + Math.sin(t * 11 - i * 0.9) * amp - (mood === "sad" ? i * 0.03 : 0);
      m.rotation.z = Math.sin(t * 11 - i * 0.9) * 0.3;
    });
  });

  return (
    <group>
      {/* torso in the team color */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.13, 0.16, 0.26, 14]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* steering wheel */}
      <mesh position={[0.3, 0.14, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.09, 0.018, 6, 20]} />
        <meshStandardMaterial color={INK} />
      </mesh>
      {/* arms */}
      {[-1, 1].map((side, i) => (
        <group key={side} position={[0.02, 0.2, side * 0.13]} ref={(g) => void (arms.current[i] = g)}>
          <mesh position={[0.13, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[0.035, 0.035, 0.26, 8]} />
            <meshStandardMaterial color={color} roughness={0.5} />
          </mesh>
          <mesh position={[0.27, 0, 0]}>
            <sphereGeometry args={[0.05, 10, 8]} />
            <meshStandardMaterial color={driver.fur} roughness={0.75} />
          </mesh>
        </group>
      ))}
      {/* scarf trailing behind */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[-0.13 - i * 0.1, 0.3, 0]} ref={(m) => void (scarf.current[i] = m)}>
          <boxGeometry args={[0.11, 0.025, 0.12 - i * 0.015]} />
          <meshStandardMaterial color={driver.scarf} emissive={driver.scarf} emissiveIntensity={0.3} />
        </mesh>
      ))}
      <group ref={head} position={[0, 0.42, 0]}>
        <Head3D driver={driver} mood={mood} />
      </group>
    </group>
  );
}

// ─── kart ────────────────────────────────────────────────────────────────────

function KartBody({
  color,
  driver,
  mood,
  wheels,
}: {
  color: string;
  driver: Driver;
  mood: Mood;
  wheels: MutableRefObject<THREE.Group[]>;
}) {
  const paint = <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} metalness={0.3} roughness={0.4} />;
  const wheel = (x: number, z: number, r: number, i: number) => (
    <group key={i} position={[x, r, z]} ref={(g) => void (g && (wheels.current[i] = g))}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[r, r, 0.16, 14]} />
        <meshStandardMaterial color="#0b0820" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, z > 0 ? 0.085 : -0.085]}>
        <boxGeometry args={[r * 1.2, 0.02, 0.06]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
    </group>
  );
  return (
    <group>
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[1.5, 0.22, 0.8]} />
        {paint}
      </mesh>
      <mesh position={[0.85, 0.3, 0]} rotation={[0, 0, -0.25]}>
        <boxGeometry args={[0.5, 0.14, 0.62]} />
        {paint}
      </mesh>
      <mesh position={[-0.1, 0.48, 0]}>
        <boxGeometry args={[0.5, 0.14, 0.5]} />
        <meshStandardMaterial color="#1e1b4b" />
      </mesh>
      <group position={[-0.12, 0.5, 0]}>
        <Driver3D driver={driver} color={color} mood={mood} />
      </group>
      <mesh position={[-0.7, 0.55, 0]}>
        <boxGeometry args={[0.06, 0.3, 0.06]} />
        <meshStandardMaterial color="#1e1b4b" />
      </mesh>
      <mesh position={[-0.72, 0.72, 0]}>
        <boxGeometry args={[0.3, 0.05, 0.95]} />
        {paint}
      </mesh>
      {wheel(-0.5, 0.45, 0.24, 0)}
      {wheel(-0.5, -0.45, 0.24, 1)}
      {wheel(0.55, 0.45, 0.2, 2)}
      {wheel(0.55, -0.45, 0.2, 3)}
    </group>
  );
}

interface KartProps {
  k: number;
  target: [number, number, number];
  laneZ: number;
  boost: number | null;
  isLeader: boolean;
  isChecked: boolean;
  mood: Mood;
  positions: MutableRefObject<THREE.Vector3[]>;
}

function Kart3D({ k, target, laneZ: z, boost, isLeader, isChecked, mood, positions }: KartProps) {
  const color = kartColor(k);
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const flame = useRef<THREE.Mesh>(null);
  const crown = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const trail = useRef<THREE.Mesh>(null);
  const wheels = useRef<THREE.Group[]>([]);
  const goal = useMemo(() => new THREE.Vector3(...target), [target[0], target[1], target[2]]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (group.current) positions.current[k] = group.current.position;
  }, [k, positions]);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const before = g.position.x;
    g.position.lerp(goal, 1 - Math.exp(-dt * 3.2));
    const dx = g.position.x - before;
    for (const w of wheels.current) if (w) w.rotation.z -= dx / 0.22;
    const moving = Math.min(1, Math.abs(dx) / (dt * 2 + 1e-6));
    if (body.current) body.current.position.y = Math.abs(Math.sin(t * 22)) * 0.04 * moving;
    if (flame.current) {
      const s = 0.7 + Math.random() * 0.6;
      flame.current.scale.set(s, s * (0.8 + moving), s);
    }
    if (crown.current) crown.current.rotation.y = t * 2;
    if (ring.current) {
      const p = 1 + Math.sin(t * 6) * 0.08;
      ring.current.scale.set(p, p, p);
    }
    if (trail.current) {
      const len = Math.max(0.01, g.position.x);
      trail.current.scale.x = len;
      trail.current.position.x = len / 2;
    }
  });

  return (
    <>
      {isChecked && (
        <mesh ref={trail} position={[0, 0.15, z]}>
          <boxGeometry args={[1, 0.2, 0.5]} />
          <meshBasicMaterial color={color} transparent opacity={0.28} toneMapped={false} />
        </mesh>
      )}
      <group ref={group} position={target}>
        <group ref={body}>
          <KartBody color={color} driver={driverOf(k)} mood={mood} wheels={wheels} />
        </group>
        {boost !== null && (
          <mesh ref={flame} position={[-0.95, 0.32, 0]} rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[0.14, 0.6, 10]} />
            <meshBasicMaterial color="#fb923c" toneMapped={false} />
          </mesh>
        )}
        {isLeader && (
          <group ref={crown} position={[0, 1.65, 0]}>
            <mesh>
              <cylinderGeometry args={[0.26, 0.2, 0.22, 5, 1, true]} />
              <meshBasicMaterial color="#facc15" toneMapped={false} side={THREE.DoubleSide} />
            </mesh>
          </group>
        )}
        {isChecked && (
          <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
            <ringGeometry args={[0.95, 1.1, 48]} />
            <meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.9} />
          </mesh>
        )}
      </group>
    </>
  );
}

// ─── podium + confetti ───────────────────────────────────────────────────────

function Podium3D({ order }: { order: number[] }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.scale.y = THREE.MathUtils.lerp(ref.current.scale.y, 1, 1 - Math.exp(-dt * 4));
  });
  return (
    <group ref={ref} position={[PODIUM_X, 0, 0]} scale={[1, 0.01, 1]}>
      {order.slice(0, 3).map((k, place) => (
        <mesh key={k} position={[0, STEP_H[place] / 2, STEP_Z[place]]}>
          <boxGeometry args={[1.7, STEP_H[place], 1.7]} />
          <meshStandardMaterial color="#2e1065" />
          <Edges color={kartColor(k)} />
        </mesh>
      ))}
    </group>
  );
}

function Confetti() {
  const COUNT = 140;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const seeds = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        x: PODIUM_X + (((i * 53) % 100) / 100 - 0.5) * 8,
        z: (((i * 29) % 100) / 100 - 0.5) * 8,
        speed: 1.2 + ((i * 17) % 10) / 6,
        phase: ((i * 41) % 100) / 10,
      })),
    [],
  );
  const colors = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    const c = new THREE.Color();
    for (let i = 0; i < COUNT; i++) c.set(kartColor(i)).toArray(arr, i * 3);
    return arr;
  }, []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    seeds.forEach((s, i) => {
      const y = 7 - ((t * s.speed + s.phase) % 7);
      dummy.position.set(s.x + Math.sin(t + s.phase) * 0.3, y, s.z);
      dummy.rotation.set(t * s.speed, t * 1.3 + s.phase, 0);
      dummy.updateMatrix();
      mesh.current?.setMatrixAt(i, dummy.matrix);
    });
    if (mesh.current) mesh.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]}>
      <planeGeometry args={[0.12, 0.2]}>
        <instancedBufferAttribute attach="attributes-color" args={[colors, 3]} />
      </planeGeometry>
      <meshBasicMaterial vertexColors side={THREE.DoubleSide} toneMapped={false} />
    </instancedMesh>
  );
}

// ─── camera director ─────────────────────────────────────────────────────────

function Director({
  phase,
  index,
  players,
  checked,
  positions,
}: {
  phase: Stage3DProps["phase"];
  index: number | null;
  players: number;
  checked: number | null;
  positions: MutableRefObject<THREE.Vector3[]>;
}) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as unknown as { target: THREE.Vector3 } | null;
  const look = useRef(new THREE.Vector3(4, 0, 0));
  const manual = useRef(false);
  const desired = useMemo(() => new THREE.Vector3(), []);
  const desiredLook = useMemo(() => new THREE.Vector3(), []);
  const side = (players * LANE) / 2;

  // Each new step hands the camera back to the director.
  useEffect(() => {
    manual.current = false;
  }, [phase, index]);

  useEffect(() => {
    const el = document.querySelector("[data-cr-canvas]");
    const grab = () => (manual.current = true);
    el?.addEventListener("pointerdown", grab);
    el?.addEventListener("wheel", grab);
    return () => {
      el?.removeEventListener("pointerdown", grab);
      el?.removeEventListener("wheel", grab);
    };
  }, []);

  useFrame((state, dt) => {
    if (manual.current) return;
    const t = state.clock.elapsedTime;
    const xs = positions.current.filter(Boolean).map((p) => p.x);
    const leadX = xs.length ? Math.max(...xs) : 0;
    const checkedX = checked !== null ? positions.current[checked]?.x ?? 0 : 0;
    // Narrow (portrait-ish) canvases need the camera further back to keep every lane in frame.
    const far = (camera as THREE.PerspectiveCamera).aspect < 1.2 ? 1.8 : 1;

    switch (phase) {
      case "lap":
        desired.set(leadX - 7 * far, 3 * far, (side + 5.5) * far);
        desiredLook.set(leadX + 1.5, 0.3, 0);
        break;
      case "finish":
        {
        // Swing across the front of the podium so the drivers' faces stay in view.
        const a = Math.sin(t * 0.4) * 0.9;
        desired.set(PODIUM_X + Math.cos(a) * 8 * far, 3.4 * far, Math.sin(a) * 8 * far);
      }
        desiredLook.set(PODIUM_X, 1.5, 0);
        break;
      case "tie":
        desired.set(L + 0.9, 1.6, (side + 5) * far);
        desiredLook.set(L - 1, 0.4, 0);
        break;
      case "replay":
        desired.set(checkedX + 6 * far, 2.6 * far, (side + 3.5) * far);
        desiredLook.set(checkedX - 3, 0.3, 0);
        break;
      case "done":
        desired.set(L / 2, 17 * far, (side + 9) * far);
        desiredLook.set(L / 2, 0, 0);
        break;
      default:
        // Starting grid from the front 3/4, to introduce the drivers.
        desired.set(5 * far, 2.4 * far, (side + 4.5) * far);
        desiredLook.set(0, 0.6, 0);
    }
    const k = 1 - Math.exp(-dt * 2.2);
    camera.position.lerp(desired, k);
    look.current.lerp(desiredLook, k);
    camera.lookAt(look.current);
    controls?.target.copy(look.current);
  });
  return null;
}

// ─── labels: plain DOM over the canvas, moved by projecting kart positions ───
// (drei <Html> mounts a React root per label, and unmounting those when the
// canvas goes away throws in React 19, so labels are positioned by hand.)

function LabelProjector({
  positions,
  labels,
  leader,
}: {
  positions: MutableRefObject<THREE.Vector3[]>;
  labels: MutableRefObject<(HTMLDivElement | null)[]>;
  leader: number | null;
}) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    labels.current.forEach((el, k) => {
      const p = positions.current[k];
      if (!el || !p) return;
      v.set(p.x, p.y + (leader === k ? 2.05 : 1.6), p.z).project(camera);
      const visible = v.z < 1 && Math.abs(v.x) < 1.2 && Math.abs(v.y) < 1.2;
      el.style.opacity = visible ? "1" : "0";
      el.style.transform = `translate(-50%, -100%) translate(${((v.x + 1) / 2) * size.width}px, ${((1 - v.y) / 2) * size.height}px)`;
    });
  });
  return null;
}

// ─── stage ───────────────────────────────────────────────────────────────────

function Race(props: Stage3DProps & { labels: MutableRefObject<(HTMLDivElement | null)[]> }) {
  const { totals, trackMax, phase, leader, checked, roundPoints, order, moods, lowFx, labels } = props;
  const players = totals.length;
  const positions = useRef<THREE.Vector3[]>([]);
  const isFinish = phase === "finish";
  const isReplay = phase === "replay";
  const caOffset = useMemo(() => new THREE.Vector2(0.0025, 0.0012), []);

  return (
    <>
      <color attach="background" args={["#0b0524"]} />
      <fog attach="fog" args={["#1a0833", 22, 75]} />
      <ambientLight intensity={0.45} />
      <hemisphereLight args={["#e879f9", "#22d3ee", 0.6]} />
      <directionalLight position={[6, 12, 8]} intensity={1.3} />

      <Scenery />
      <Floor direction={phase === "lap" ? 1 : isReplay ? -3 : 0} />
      <Track players={players} />

      {totals.map((total, k) => {
        const place = order.indexOf(k);
        const onPodium = isFinish && place >= 0 && place < 3;
        const target: [number, number, number] = onPodium
          ? [PODIUM_X, STEP_H[place], STEP_Z[place]]
          : [(total / trackMax) * L, 0, laneZ(k, players)];
        return (
          <Kart3D
            key={k}
            k={k}
            target={target}
            laneZ={laneZ(k, players)}
            boost={phase === "lap" && roundPoints ? roundPoints[k] : null}
            isLeader={leader === k}
            isChecked={checked === k}
            mood={moods[k] ?? "race"}
            positions={positions}
          />
        );
      })}

      {isFinish && <Podium3D order={order} />}
      {isFinish && !lowFx && <Confetti />}

      <LabelProjector positions={positions} labels={labels} leader={leader} />
      <Director phase={phase} index={props.index} players={players} checked={checked} positions={positions} />
      <OrbitControls makeDefault enablePan={false} enableDamping={false} maxPolarAngle={Math.PI / 2.05} />

      {!lowFx && (
        <EffectComposer key={isReplay ? "vhs" : "clean"}>
          {isReplay ? (
            <>
              <Bloom intensity={1.1} luminanceThreshold={0.25} mipmapBlur />
              <ChromaticAberration offset={caOffset} radialModulation={false} modulationOffset={0} />
              <Noise opacity={0.18} premultiply />
              <Vignette darkness={0.7} />
            </>
          ) : (
            <>
              <Bloom intensity={1.1} luminanceThreshold={0.25} mipmapBlur />
              <Vignette darkness={0.55} />
            </>
          )}
        </EffectComposer>
      )}
    </>
  );
}

export default function Stage3D(props: Stage3DProps) {
  const labels = useRef<(HTMLDivElement | null)[]>([]);
  const { totals, roundPoints, phase, index } = props;
  return (
    <div className={styles.canvasWrap} data-cr-canvas>
      <Canvas dpr={[1, 2]} camera={{ fov: 50, position: [-6, 5, 10] }} gl={{ antialias: true }}>
        <Race {...props} labels={labels} />
      </Canvas>
      <div className={styles.labels3d} aria-hidden>
        {totals.map((total, k) => {
          const pts = phase === "lap" && roundPoints ? roundPoints[k] : 0;
          return (
            <div key={k} ref={(el) => void (labels.current[k] = el)} className={styles.label3d}>
              {pts > 0 && (
                <div key={`${index}-${k}`} className={styles.popup3d}>
                  +{pts}
                </div>
              )}
              <div className={styles.tag3d} style={{ ["--c" as string]: kartColor(k) }}>
                {kartName(k)}
                <b>{total}</b>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
